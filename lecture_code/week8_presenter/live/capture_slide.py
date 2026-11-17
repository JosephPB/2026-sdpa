"""Capture prints and Matplotlib figures for both live runs and saved outputs."""
def run_example(source, setup, saved=False):
    import base64
    import contextlib
    import html
    import io
    import json
    import traceback
    import warnings
    from pathlib import Path
    from urllib.parse import parse_qs, urlsplit
    chunks, images = [], []
    namespace = {}
    stream = io.StringIO()
    try:
        with contextlib.redirect_stdout(stream), warnings.catch_warnings():
            warnings.filterwarnings('ignore', message='FigureCanvasAgg is non-interactive.*')
            exec(setup, namespace)
            plt, pd, requests = (namespace[name] for name in ['plt', 'pd', 'requests'])
            plt.close('all')
            plt.show = lambda: None
            original_get = requests.get
            if saved:
                def saved_get(url, params=None, **kwargs):
                    query = {key: value[-1] for key, value in parse_qs(urlsplit(url).query).items()}
                    query.update({key: str(value) for key, value in (params or {}).items()})
                    if urlsplit(url).netloc == 'roadtraffic.dft.gov.uk':
                        if query.get('filter[local_authority_id]') != '144' or query.get('filter[year]') != '2023':
                            raise ValueError('Saved mode supports the bundled Bristol 2023 query only.')
                        preview = query.get('page[size]') == '2' and query.get('fields') == 'road_name,cars_and_taxis'
                        if not preview and (query.get('page[size]') != '10000' or query.get('fields')):
                            raise ValueError('Saved mode supports the two-row preview or the complete saved query.')
                        body = Path('data/raw/traffic-preview.json' if preview else 'data/raw/traffic-2023.json').read_bytes()
                        content_type = 'application/json'
                    elif urlsplit(url).netloc == 'books.toscrape.com':
                        body = Path('data/raw/books-to-scrape.html').read_bytes()
                        content_type = 'text/html; charset=utf-8'
                    else:
                        raise ValueError('This URL has no saved teaching response. Restart in live mode.')
                    result = requests.Response()
                    result.status_code = 200
                    result._content = body
                    result.encoding = 'utf-8'
                    result.headers['Content-Type'] = content_type
                    result.url = requests.Request('GET', url, params=params).prepare().url
                    return result
                requests.get = saved_get
            def show_print(*args, **kwargs):
                buffer = io.StringIO()
                print(*args, **dict(kwargs, file=buffer))
                text = buffer.getvalue()
                if len(args) == 1 and isinstance(args[0], pd.DataFrame):
                    content = '<div class="table-output">' + args[0].to_html(border=0, max_rows=6, max_cols=6) + '</div>'
                else:
                    content = '<pre class="print-output">' + html.escape(text) + '</pre>'
                chunks.append({'html': content, 'text': text})
            namespace['print'] = show_print
            try:
                exec(source, namespace)
                for number in plt.get_fignums():
                    buffer = io.BytesIO()
                    plt.figure(number).savefig(buffer, format='png', dpi=150, bbox_inches='tight')
                    images.append(base64.b64encode(buffer.getvalue()).decode())
            finally:
                requests.get = original_get
                plt.close('all')
        return {'chunks': chunks, 'images': images, 'error': None, 'mode': 'saved' if saved else 'live'}
    except Exception:
        return {'chunks': chunks, 'images': images, 'error': traceback.format_exc(), 'mode': 'saved' if saved else 'live'}


if __name__ == '__main__':
    import json
    import sys
    from pathlib import Path
    request = json.load(sys.stdin)
    result = run_example(request['code'], Path('live/slide_setup.py').read_text(), request.get('saved', False))
    print(json.dumps(result))
