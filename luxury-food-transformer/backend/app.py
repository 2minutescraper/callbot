"""Luxury Food Photo Transformer - HTTP API and static host for the UI."""

import os

from flask import Flask, jsonify, request, send_file, send_from_directory
from flask_cors import CORS
from io import BytesIO

import config
import imaging
import jobs
import prompt as prompt_module
import providers

FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'frontend')

app = Flask(__name__, static_folder=None)
app.config['MAX_CONTENT_LENGTH'] = config.MAX_UPLOAD_MB * 1024 * 1024 * config.MAX_IMAGES
CORS(app)


def error(message, status=400, **extra):
    payload = {'error': message}
    payload.update(extra)
    return jsonify(payload), status


# --- UI -----------------------------------------------------------------
@app.get('/')
def index():
    return send_from_directory(FRONTEND_DIR, 'index.html')


@app.get('/<path:asset>')
def static_asset(asset):
    return send_from_directory(FRONTEND_DIR, asset)


# --- API ----------------------------------------------------------------
@app.get('/api/health')
def health():
    active = providers.get_provider()
    return jsonify({
        'status': 'ok',
        'active_provider': active.name if active else None,
        'providers': providers.describe_all(),
        'local_fallback_enabled': config.ENABLE_LOCAL_FALLBACK,
        'min_images': config.MIN_IMAGES,
        'max_images': config.MAX_IMAGES,
        'output': {
            'width': config.OUTPUT_WIDTH,
            'height': config.OUTPUT_HEIGHT,
            'aspect_ratio': config.ASPECT_RATIO,
        },
    })


@app.post('/api/transform')
def transform():
    """Accept 1-4 photos and start a transformation for every one of them."""
    files = [f for f in request.files.getlist('images') if f and f.filename]
    if not files:
        return error('Upload between {} and {} food photos.'.format(
            config.MIN_IMAGES, config.MAX_IMAGES))
    if len(files) > config.MAX_IMAGES:
        return error('This transformer takes at most {} photos per batch; you sent {}.'.format(
            config.MAX_IMAGES, len(files)))

    uploads = []
    for f in files:
        raw = f.read()
        if not raw:
            return error('"{}" is empty.'.format(f.filename))
        if len(raw) > config.MAX_UPLOAD_MB * 1024 * 1024:
            return error('"{}" is larger than {} MB.'.format(f.filename, config.MAX_UPLOAD_MB))
        try:
            imaging.decode(raw)
        except imaging.ImageError:
            return error('"{}" is not a readable image.'.format(f.filename))
        uploads.append((f.filename, raw))

    job = jobs.store.create(uploads)
    return jsonify(job.to_dict()), 202


@app.get('/api/jobs/<job_id>')
def job_status(job_id):
    job = jobs.store.get(job_id)
    if job is None:
        return error('No such job.', 404)
    return jsonify(job.to_dict())


def _task_or_none(job_id, index):
    job = jobs.store.get(job_id)
    if job is None or index < 0 or index >= len(job.tasks):
        return None
    return job.tasks[index]


@app.get('/api/jobs/<job_id>/result/<int:index>')
def job_result(job_id, index):
    task = _task_or_none(job_id, index)
    if task is None:
        return error('No such image.', 404)
    if not task.result_bytes:
        return error('That image is still being transformed.', 409, status=task.status)
    download = request.args.get('download') == '1'
    stem = os.path.splitext(os.path.basename(task.filename))[0] or 'photo'
    return send_file(
        BytesIO(task.result_bytes),
        mimetype='image/jpeg',
        as_attachment=download,
        download_name='{}-michelin-9x16.jpg'.format(stem),
    )


@app.get('/api/jobs/<job_id>/source/<int:index>')
def job_source(job_id, index):
    task = _task_or_none(job_id, index)
    if task is None:
        return error('No such image.', 404)
    return send_file(BytesIO(task.source_bytes), mimetype='image/jpeg')


@app.get('/api/prompt')
def brief():
    """The exact brief sent to the model - handy for tuning and debugging."""
    return jsonify({'prompt': prompt_module.build_prompt(), 'tip': prompt_module.ENGAGEMENT_TIP})


@app.errorhandler(413)
def too_large(_exc):
    return error('Those files are too large. Limit is {} MB per photo.'.format(config.MAX_UPLOAD_MB), 413)


if __name__ == '__main__':
    active = providers.get_provider()
    print('Luxury Food Photo Transformer on http://{}:{}'.format(config.HOST, config.PORT))
    print('Image provider: {}'.format(active.name if active else 'NONE - set GEMINI_API_KEY or OPENAI_API_KEY'))
    app.run(host=config.HOST, port=config.PORT, debug=config.DEBUG, threaded=True)
