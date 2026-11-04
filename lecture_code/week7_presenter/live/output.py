"""Capture slide examples in the same way during the build and in the browser."""
def run_example(source, setup):
    import io, contextlib, traceback, base64, builtins, html, warnings
    text = io.StringIO()
    chunks, images = [], []
    namespace = {'__name__': '__main__'}
    error = None
    try:
        exec(setup, namespace)
        plt = namespace['plt']
        pd = namespace['pd']
        plt.close('all')
        def capture_print(*args, **kwargs):
            # Preserve normal print semantics, including an explicit file target.
            if kwargs.get('file') is not None:
                return builtins.print(*args, **kwargs)
            buffer = io.StringIO()
            builtins.print(*args, **dict(kwargs, file=buffer))
            value = buffer.getvalue()
            text.write(value)
            if len(args) == 1 and isinstance(args[0], pd.DataFrame):
                frame = args[0]
                content = '<div class="table-output">' + frame.to_html(border=0) + '</div>'
            else:
                content = '<div class="print-output">' + html.escape(value) + '</div>'
            chunks.append({'html': content, 'text': value})
        namespace['print'] = capture_print
        with contextlib.redirect_stdout(text), warnings.catch_warnings():
            warnings.filterwarnings('ignore', message='FigureCanvasAgg is non-interactive.*')
            exec(source, namespace)
            for number in plt.get_fignums():
                buffer = io.BytesIO()
                plt.figure(number).savefig(buffer, format='png', dpi=150, bbox_inches='tight')
                images.append(base64.b64encode(buffer.getvalue()).decode())
        plt.close('all')
    except Exception:
        error = traceback.format_exc()
    return {'text': text.getvalue(), 'chunks': chunks, 'images': images, 'error': error}
