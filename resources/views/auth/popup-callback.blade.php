<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Autenticación exitosa</title>
</head>
<body>
    <p>Autenticación exitosa. Puedes cerrar esta ventana.</p>
    <script>
        if (window.opener) {
            window.opener.postMessage({ type: 'auth-success' }, {!! json_encode(config('app.url')) !!});
        }
        window.close();
    </script>
</body>
</html>
