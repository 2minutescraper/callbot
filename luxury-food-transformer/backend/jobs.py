"""Job engine: one job per upload batch, one independent result per photo.

Every photo in a batch is transformed on its own thread with its own retries,
so a failure on photo 2 can never cost you photos 1, 3 and 4.
"""

import threading
import time
import uuid
from concurrent.futures import ThreadPoolExecutor

import config
import imaging
import prompt as prompt_module
import providers

PENDING = 'pending'
RUNNING = 'running'
DONE = 'done'
FAILED = 'failed'


class ImageTask:
    """One uploaded photo and the render made from it."""

    def __init__(self, index, filename, source_bytes, source_size):
        self.index = index
        self.filename = filename
        self.source_bytes = source_bytes
        self.source_size = source_size
        self.status = PENDING
        self.result_bytes = None
        self.provider = None
        self.fallback = False
        self.attempts = 0
        self.error = None
        self.started_at = None
        self.finished_at = None

    def to_dict(self):
        return {
            'index': self.index,
            'filename': self.filename,
            'status': self.status,
            'provider': self.provider,
            'fallback': self.fallback,
            'attempts': self.attempts,
            'error': self.error,
            'width': config.OUTPUT_WIDTH if self.result_bytes else None,
            'height': config.OUTPUT_HEIGHT if self.result_bytes else None,
            'source_url': '/api/jobs/{}/source/{}'.format(self.job_id, self.index),
            'result_url': ('/api/jobs/{}/result/{}'.format(self.job_id, self.index)
                           if self.result_bytes else None),
            'duration_seconds': (round(self.finished_at - self.started_at, 1)
                                 if self.started_at and self.finished_at else None),
        }


class Job:
    def __init__(self, tasks):
        self.id = uuid.uuid4().hex[:16]
        self.tasks = tasks
        for task in tasks:
            task.job_id = self.id
        self.status = PENDING
        self.created_at = time.time()
        self.lock = threading.Lock()

    @property
    def finished(self):
        return all(t.status in (DONE, FAILED) for t in self.tasks)

    def to_dict(self):
        with self.lock:
            payload = {
                'job_id': self.id,
                'status': self.status,
                'total': len(self.tasks),
                'completed': sum(1 for t in self.tasks if t.status == DONE),
                'failed': sum(1 for t in self.tasks if t.status == FAILED),
                'aspect_ratio': config.ASPECT_RATIO,
                'images': [t.to_dict() for t in self.tasks],
            }
        # The suggestion is part of every finished response, per the spec.
        if payload['status'] == DONE and payload['completed']:
            payload['tip'] = prompt_module.ENGAGEMENT_TIP
        return payload


class JobStore:
    """In-memory jobs plus the worker pool that fills them."""

    def __init__(self):
        self._jobs = {}
        self._lock = threading.Lock()
        self._pool = ThreadPoolExecutor(max_workers=config.MAX_WORKERS,
                                        thread_name_prefix='transform')

    def create(self, uploads):
        """uploads: list of (filename, raw_bytes). Returns a started Job."""
        tasks = []
        for index, (filename, raw) in enumerate(uploads):
            source_bytes, size = imaging.prepare_source(raw)
            tasks.append(ImageTask(index, filename, source_bytes, size))

        job = Job(tasks)
        with self._lock:
            self._prune()
            self._jobs[job.id] = job

        job.status = RUNNING
        for task in tasks:
            self._pool.submit(self._run_task, job, task)
        return job

    def get(self, job_id):
        with self._lock:
            return self._jobs.get(job_id)

    # -- internals -------------------------------------------------------
    def _run_task(self, job, task):
        task.status = RUNNING
        task.started_at = time.time()
        brief = prompt_module.build_prompt()
        provider = providers.get_provider()

        if provider is not None:
            for attempt in range(1, config.MAX_ATTEMPTS + 1):
                task.attempts = attempt
                try:
                    raw = provider.transform(task.source_bytes, brief)
                    task.result_bytes = imaging.to_portrait_9x16(raw)
                    task.provider = provider.name
                    task.error = None
                    break
                except Exception as exc:  # noqa: BLE001 - any failure is retryable
                    task.error = str(exc)
                    if attempt < config.MAX_ATTEMPTS:
                        time.sleep(config.RETRY_BACKOFF_SECONDS * attempt)
        else:
            task.error = 'No image provider is configured.'

        # Never skip an image: fall back to a local render rather than nothing.
        if task.result_bytes is None and config.ENABLE_LOCAL_FALLBACK:
            fallback = providers.fallback_provider()
            try:
                raw = fallback.transform(task.source_bytes, brief)
                task.result_bytes = imaging.to_portrait_9x16(raw)
                task.provider = fallback.name
                task.fallback = True
            except Exception as exc:  # noqa: BLE001
                task.error = '{} (fallback also failed: {})'.format(task.error, exc)

        task.status = DONE if task.result_bytes else FAILED
        task.finished_at = time.time()

        with job.lock:
            if job.finished:
                job.status = DONE if any(t.status == DONE for t in job.tasks) else FAILED

    def _prune(self):
        cutoff = time.time() - config.JOB_TTL_SECONDS
        for job_id in [j for j, job in self._jobs.items()
                       if job.created_at < cutoff and job.finished]:
            del self._jobs[job_id]


store = JobStore()
