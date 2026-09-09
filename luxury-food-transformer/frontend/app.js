/* Luxury Food Photo Transformer - upload, poll, render. */
(function () {
  'use strict';

  var MAX = 4;
  var POLL_MS = 2000;

  var selected = [];      // { file, url }
  var pollTimer = null;

  var el = {
    dropzone: document.getElementById('dropzone'),
    fileInput: document.getElementById('fileInput'),
    tray: document.getElementById('tray'),
    count: document.getElementById('count'),
    clearBtn: document.getElementById('clearBtn'),
    transformBtn: document.getElementById('transformBtn'),
    alert: document.getElementById('alert'),
    results: document.getElementById('results'),
    grid: document.getElementById('grid'),
    tip: document.getElementById('tip'),
    downloadAll: document.getElementById('downloadAll'),
    againBtn: document.getElementById('againBtn'),
    uploadPanel: document.getElementById('uploadPanel'),
    status: document.getElementById('status'),
    statusText: document.getElementById('statusText')
  };

  // --- studio status ----------------------------------------------------
  fetch('/api/health').then(function (r) { return r.json(); }).then(function (h) {
    if (h.active_provider) {
      el.status.className = 'status live';
      el.statusText.textContent = 'Studio ready · ' + h.active_provider +
        ' · ' + h.output.width + '×' + h.output.height + ' (9:16)';
    } else if (h.local_fallback_enabled) {
      el.status.className = 'status degraded';
      el.statusText.textContent = 'No AI provider configured — set GEMINI_API_KEY or OPENAI_API_KEY';
    } else {
      el.status.className = 'status degraded';
      el.statusText.textContent = 'No image provider configured';
    }
  }).catch(function () {
    el.status.className = 'status degraded';
    el.statusText.textContent = 'Backend unreachable';
  });

  // --- selection --------------------------------------------------------
  function showAlert(message) {
    el.alert.textContent = message;
    el.alert.hidden = !message;
  }

  function addFiles(files) {
    showAlert('');
    var incoming = Array.prototype.slice.call(files).filter(function (f) {
      return f.type.indexOf('image/') === 0;
    });
    if (!incoming.length) { return showAlert('Those files are not images.'); }

    var room = MAX - selected.length;
    if (incoming.length > room) {
      showAlert('You can transform ' + MAX + ' photos at a time — kept the first ' +
        room + ' of what you added.');
      incoming = incoming.slice(0, room);
    }
    incoming.forEach(function (file) {
      selected.push({ file: file, url: URL.createObjectURL(file) });
    });
    renderTray();
  }

  function removeAt(index) {
    URL.revokeObjectURL(selected[index].url);
    selected.splice(index, 1);
    showAlert('');
    renderTray();
  }

  function renderTray() {
    el.tray.innerHTML = '';
    selected.forEach(function (item, index) {
      var chip = document.createElement('div');
      chip.className = 'chip';

      var img = document.createElement('img');
      img.src = item.url;
      img.alt = item.file.name;

      var remove = document.createElement('button');
      remove.type = 'button';
      remove.innerHTML = '&times;';
      remove.title = 'Remove ' + item.file.name;
      remove.addEventListener('click', function () { removeAt(index); });

      var name = document.createElement('span');
      name.className = 'name';
      name.textContent = item.file.name;

      chip.append(img, remove, name);
      el.tray.appendChild(chip);
    });

    el.tray.hidden = selected.length === 0;
    el.clearBtn.hidden = selected.length === 0;
    el.count.textContent = selected.length + ' of ' + MAX + ' selected';
    el.transformBtn.disabled = selected.length === 0;
    el.transformBtn.textContent = selected.length > 1
      ? 'Transform all ' + selected.length + ' photos'
      : 'Transform to Michelin quality';
    el.dropzone.classList.toggle('full', selected.length >= MAX);
  }

  el.dropzone.addEventListener('click', function () { el.fileInput.click(); });
  el.dropzone.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.fileInput.click(); }
  });
  el.fileInput.addEventListener('change', function (e) {
    addFiles(e.target.files);
    e.target.value = '';
  });
  ['dragenter', 'dragover'].forEach(function (type) {
    el.dropzone.addEventListener(type, function (e) {
      e.preventDefault();
      el.dropzone.classList.add('over');
    });
  });
  ['dragleave', 'drop'].forEach(function (type) {
    el.dropzone.addEventListener(type, function (e) {
      e.preventDefault();
      el.dropzone.classList.remove('over');
    });
  });
  el.dropzone.addEventListener('drop', function (e) {
    if (e.dataTransfer && e.dataTransfer.files) { addFiles(e.dataTransfer.files); }
  });
  el.clearBtn.addEventListener('click', function () {
    selected.forEach(function (item) { URL.revokeObjectURL(item.url); });
    selected = [];
    showAlert('');
    renderTray();
  });

  // --- transform --------------------------------------------------------
  el.transformBtn.addEventListener('click', function () {
    if (!selected.length) { return; }
    var body = new FormData();
    selected.forEach(function (item) { body.append('images', item.file, item.file.name); });

    el.transformBtn.disabled = true;
    el.transformBtn.textContent = 'Plating…';
    showAlert('');

    fetch('/api/transform', { method: 'POST', body: body })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
      .then(function (res) {
        if (!res.ok) { throw new Error(res.body.error || 'The transform could not be started.'); }
        el.results.hidden = false;
        el.uploadPanel.hidden = true;
        render(res.body);
        el.results.scrollIntoView({ behavior: 'smooth', block: 'start' });
        poll(res.body.job_id);
      })
      .catch(function (err) {
        showAlert(err.message);
        el.transformBtn.disabled = false;
        renderTray();
      });
  });

  function poll(jobId) {
    clearTimeout(pollTimer);
    pollTimer = setTimeout(function () {
      fetch('/api/jobs/' + jobId)
        .then(function (r) { return r.json(); })
        .then(function (job) {
          render(job);
          if (job.status !== 'done' && job.status !== 'failed') { poll(jobId); }
        })
        .catch(function () { poll(jobId); });
    }, POLL_MS);
  }

  // --- results ----------------------------------------------------------
  function render(job) {
    el.grid.innerHTML = '';
    job.images.forEach(function (image, i) {
      el.grid.appendChild(card(image, selected[i]));
    });

    var finished = job.status === 'done' || job.status === 'failed';
    el.downloadAll.hidden = !(finished && job.completed > 0);
    el.againBtn.hidden = !finished;

    if (job.tip) {
      el.tip.textContent = job.tip;
      el.tip.hidden = false;
    }
    el.downloadAll.onclick = function () {
      job.images.forEach(function (image, i) {
        if (!image.result_url) { return; }
        setTimeout(function () {
          var a = document.createElement('a');
          a.href = image.result_url + '?download=1';
          a.download = '';
          document.body.appendChild(a);
          a.click();
          a.remove();
        }, i * 350);
      });
    };
  }

  function card(image, local) {
    var wrapper = document.createElement('div');
    wrapper.className = 'card';

    var frame = document.createElement('div');
    frame.className = 'frame';

    var img = document.createElement('img');
    var done = Boolean(image.result_url);
    img.src = done ? image.result_url : (local ? local.url : image.source_url);
    img.alt = done ? 'Michelin-quality render of ' + image.filename : image.filename;
    if (!done) { img.className = 'before'; }
    frame.appendChild(img);

    var badge = document.createElement('span');
    badge.className = 'badge' + (done && !image.fallback ? ' gold' : (image.fallback ? ' warn' : ''));
    badge.textContent = done ? (image.fallback ? 'Fallback render' : 'Michelin 9:16') : 'Photo ' + (image.index + 1);
    frame.appendChild(badge);

    if (!done) {
      var overlay = document.createElement('div');
      overlay.className = 'overlay';
      if (image.status === 'failed') {
        overlay.innerHTML = '<strong>Could not render</strong>';
        var why = document.createElement('span');
        why.textContent = image.error || 'Unknown error';
        overlay.appendChild(why);
      } else {
        var spinner = document.createElement('div');
        spinner.className = 'spinner';
        var label = document.createElement('span');
        label.textContent = image.attempts > 1
          ? 'Re-plating… attempt ' + image.attempts
          : 'Plating, lighting, styling…';
        overlay.append(spinner, label);
      }
      frame.appendChild(overlay);
    }
    wrapper.appendChild(frame);

    var foot = document.createElement('div');
    foot.className = 'card-foot';

    var meta = document.createElement('span');
    meta.className = 'meta';
    meta.textContent = image.filename +
      (image.duration_seconds ? ' · ' + image.duration_seconds + 's' : '');
    foot.appendChild(meta);

    if (done) {
      var links = document.createElement('div');
      links.className = 'links';

      var toggle = document.createElement('button');
      toggle.className = 'toggle';
      toggle.type = 'button';
      toggle.textContent = 'Before';
      var showingAfter = true;
      toggle.addEventListener('click', function () {
        showingAfter = !showingAfter;
        img.src = showingAfter ? image.result_url : image.source_url;
        img.classList.toggle('before', !showingAfter);
        toggle.textContent = showingAfter ? 'Before' : 'After';
      });

      var download = document.createElement('a');
      download.href = image.result_url + '?download=1';
      download.textContent = 'Download';
      download.setAttribute('download', '');

      links.append(toggle, download);
      foot.appendChild(links);
    }
    wrapper.appendChild(foot);

    if (image.fallback) {
      var note = document.createElement('p');
      note.className = 'card-note';
      note.textContent = 'The AI studio was unreachable, so this is a locally graded 9:16 ' +
        'crop of your original rather than a re-plated render.';
      wrapper.appendChild(note);
    }
    return wrapper;
  }

  el.againBtn.addEventListener('click', function () {
    clearTimeout(pollTimer);
    selected.forEach(function (item) { URL.revokeObjectURL(item.url); });
    selected = [];
    el.results.hidden = true;
    el.tip.hidden = true;
    el.uploadPanel.hidden = false;
    renderTray();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  renderTray();
}());
