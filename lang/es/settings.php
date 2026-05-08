<?php

declare(strict_types=1);

return [
    'nav' => [
        'perfil' => 'Perfil',
        'seguridad' => 'Seguridad',
        'notificaciones' => 'Notificaciones',
        'privacidad' => 'Privacidad',
    ],
    'row' => [
        'edit_default' => 'Actualizar',
    ],
    'configuracion' => [
        'a11y' => [
            'open_menu' => 'Abrir menú',
            'account_settings' => 'Configuración de la cuenta',
        ],
        'heading' => 'Configuración',
    ],
    'profile' => [
        'breadcrumb' => 'Profile settings',
        'head_title' => 'Profile settings',
        'a11y' => [
            'heading' => 'Profile Settings',
        ],
        'information' => [
            'title' => 'Profile information',
            'description' => 'Update your name and email address',
        ],
        'fields' => [
            'name' => 'Name',
            'name_placeholder' => 'Full name',
            'email' => 'Email address',
            'email_placeholder' => 'Email address',
        ],
        'verification' => [
            'unverified_prefix' => 'Your email address is unverified.',
            'resend_link' => 'Click here to resend the verification email.',
            'sent' => 'A new verification link has been sent to your email address.',
        ],
        'save_button' => 'Save',
        'saved' => 'Saved',
    ],
    'password' => [
        'breadcrumb' => 'Password settings',
        'head_title' => 'Password settings',
        'a11y' => [
            'heading' => 'Password Settings',
        ],
        'update' => [
            'title' => 'Update password',
            'description' => 'Ensure your account is using a long, random password to stay secure',
        ],
        'fields' => [
            'current' => 'Current password',
            'current_placeholder' => 'Current password',
            'new' => 'New password',
            'new_placeholder' => 'New password',
            'confirm' => 'Confirm password',
            'confirm_placeholder' => 'Confirm password',
        ],
        'save_button' => 'Save password',
        'saved' => 'Saved',
    ],
    'two_factor' => [
        'breadcrumb' => 'Two-Factor Authentication',
        'head_title' => 'Two-Factor Authentication',
        'a11y' => [
            'heading' => 'Two-Factor Authentication Settings',
        ],
        'section' => [
            'title' => 'Two-Factor Authentication',
            'description' => 'Manage your two-factor authentication settings',
        ],
        'enabled_badge' => 'Enabled',
        'disabled_badge' => 'Disabled',
        'enabled_description' => 'With two-factor authentication enabled, you will be prompted for a secure, random pin during login, which you can retrieve from the TOTP-supported application on your phone.',
        'disabled_description' => 'When you enable two-factor authentication, you will be prompted for a secure pin during login. This pin can be retrieved from a TOTP-supported application on your phone.',
        'disable_button' => 'Disable 2FA',
        'continue_setup_button' => 'Continue Setup',
        'enable_button' => 'Enable 2FA',
        'errors' => [
            'qr_code' => 'No se pudo obtener el código QR',
            'setup_key' => 'No se pudo obtener la clave de configuración',
            'recovery_codes' => 'No se pudieron obtener los códigos de recuperación',
        ],
    ],
    'appearance' => [
        'breadcrumb' => 'Appearance settings',
        'head_title' => 'Appearance settings',
        'a11y' => [
            'heading' => 'Appearance Settings',
        ],
        'section' => [
            'title' => 'Appearance settings',
            'description' => "Update your account's appearance settings",
        ],
        'tabs' => [
            'light' => 'Light',
            'dark' => 'Dark',
            'system' => 'System',
        ],
    ],
    'avatar_upload' => [
        'crop_dialog' => [
            'title' => 'Recortar foto',
            'description' => 'Ajusta el recorte de tu foto de perfil.',
        ],
        'a11y' => [
            'crop_image_alt' => 'Recortar',
        ],
        'change_photo' => 'Cambiar foto',
        'help_text' => 'JPG, GIF o PNG. 4MB max.',
        'cancel' => 'Cancelar',
        'save' => 'Guardar',
        'saving' => 'Guardando...',
    ],
    'perfil' => [
        'photo' => [
            'title' => 'Foto de perfil',
            'description' => 'Esta imagen será visible públicamente en tu perfil.',
        ],
        'personal' => [
            'title' => 'Información personal',
            'description' => 'Esta información será visible públicamente en tu perfil.',
        ],
        'fields' => [
            'name' => 'Nombre completo',
            'email' => 'Correo electrónico',
            'username' => 'Nombre de usuario',
            'description' => 'Descripción',
            'description_placeholder' => 'Cuéntanos sobre ti...',
        ],
    ],
    'seguridad' => [
        'password' => [
            'title' => 'Contraseña',
            'description' => 'Actualiza la contraseña asociada a tu cuenta.',
            'label' => 'Contraseña',
            'edit_label' => 'Cambiar',
        ],
        'sessions' => [
            'title' => 'Sesiones activas',
            'description' => 'Cierra sesión en todos los demás dispositivos donde hayas iniciado sesión.',
            'logout_button' => 'Cerrar otras sesiones',
        ],
    ],
    'notificaciones' => [
        'title' => 'Notificaciones',
        'description' => 'Elige cómo y cuándo quieres recibir notificaciones.',
        'followers' => [
            'label' => 'Nuevos seguidores',
            'description' => 'Recibe una notificación cuando alguien empieza a seguirte.',
        ],
        'mentions' => [
            'label' => 'Menciones',
            'description' => 'Recibe una notificación cuando alguien te menciona en un post.',
        ],
        'comments' => [
            'label' => 'Comentarios',
            'description' => 'Recibe una notificación cuando alguien comenta en tus posts.',
        ],
        'likes' => [
            'label' => 'Me gusta',
            'description' => 'Recibe una notificación cuando alguien le da me gusta a tus posts.',
        ],
        'updates' => [
            'label' => 'Actualizaciones de la plataforma',
            'description' => 'Entérate de nuevas funciones y mejoras de Tekitl.',
        ],
    ],
    'privacidad' => [
        'visibility' => [
            'title' => 'Visibilidad de la cuenta',
            'description' => 'Controla quién puede ver tu perfil y tu contenido.',
        ],
        'private_account' => [
            'label' => 'Cuenta privada',
            'description' => 'Solo tus seguidores aprobados podrán ver tus posts.',
        ],
        'show_email' => [
            'label' => 'Mostrar correo electrónico en el perfil',
            'description' => 'Tu correo será visible para otros usuarios.',
        ],
        'allow_dms' => [
            'label' => 'Permitir mensajes directos',
            'description' => 'Cualquier usuario puede enviarte mensajes directos.',
        ],
        'data' => [
            'title' => 'Datos y actividad',
            'description' => 'Gestiona cómo se usan tus datos en la plataforma.',
        ],
        'download' => [
            'label' => 'Descargar mis datos',
            'value' => 'Solicita una copia de toda tu información',
            'edit_label' => 'Solicitar',
        ],
        'delete' => [
            'label' => 'Eliminar cuenta',
            'value' => 'Esta acción es permanente e irreversible',
            'edit_label' => 'Eliminar',
        ],
    ],
    'delete_user' => [
        'heading' => [
            'title' => 'Eliminar cuenta',
            'description' => 'Elimina tu cuenta y todos sus recursos',
        ],
        'warning' => 'Advertencia',
        'warning_body' => 'Procede con cuidado, esta acción no puede deshacerse.',
        'trigger_button' => 'Eliminar cuenta',
        'dialog' => [
            'title' => '¿Estás seguro de que quieres eliminar tu cuenta?',
            'description' => 'Una vez eliminada tu cuenta, todos sus recursos y datos se eliminarán permanentemente. Ingresa tu contraseña para confirmar que deseas eliminar tu cuenta de forma permanente.',
        ],
        'fields' => [
            'password' => 'Contraseña',
            'password_placeholder' => 'Contraseña',
        ],
        'cancel_button' => 'Cancelar',
        'confirm_button' => 'Eliminar cuenta',
    ],
];
