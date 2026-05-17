<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>@lang('auth.ui.popup_callback.page_title')</title>
</head>
<body>
    <p>@lang('auth.ui.popup_callback.success_message')</p>
    <script>
        if (window.opener) {
            window.opener.postMessage({ type: 'auth-success' }, {!! json_encode(config('app.url')) !!});
        }
        window.close();
    </script>
</body>
</html>
