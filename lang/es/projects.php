<?php

declare(strict_types=1);

return [
    'show' => [
        'open_menu' => 'Abrir menú',
        'title' => 'Proyecto',
        'activity' => 'Actividad del proyecto',
        'comments' => 'Comentarios',
        'tabs' => [
            'equipo' => 'Equipo',
            'actividad' => 'Actividad',
            'comentarios' => 'Comentarios',
        ],
    ],
    'dashboard' => [
        'title' => 'Dashboard',
    ],
    'welcome' => [
        'open_menu' => 'Abrir menú',
        'home' => 'Inicio',
        'search_placeholder' => 'Buscar',
        'trending' => 'Tendencias',
        'who_to_follow' => 'A quién seguir',
        'see_more' => 'Ver más',
        'follow' => 'Seguir',
        'following' => 'Siguiendo',
        'footer' => '© 2026 Tekitl · Privacidad · Términos',
    ],
    'header' => [
        'title_placeholder' => 'Título del proyecto',
        'description_placeholder' => 'Descripción del proyecto',
    ],
    'volunteers' => [
        'applications_closed' => 'No se aceptan postulaciones en este momento.',
    ],
    'stage' => [
        'unknown_target' => 'La etapa solicitada no existe.',
        'illegal_transition' => 'Esta transición no está permitida desde el estado actual.',
        'aria_label' => 'Etapa del proyecto: :stage',
        'label' => [
            'planning' => 'Planificación',
            'in_execution' => 'En ejecución',
            'completed' => 'Completado',
            'aborted' => 'Abortado',
        ],
    ],
    'roles' => [
        'title_placeholder' => 'Título del rol *',
        'description_placeholder' => 'Descripción (opcional)',
        'slots' => 'Plazas',
        'hours_estimated' => 'Horas estimadas',
        'application_dialog_title' => 'Solicitud de voluntariado',
        'pending_application' => 'Solicitud pendiente',
        'looking_for_roles' => 'Roles buscados',
        'member' => 'Miembro ✓',
        'pending_approval_suffix' => '— pendiente de aprobación',
    ],
    'team' => [
        'title' => 'Equipo del proyecto',
    ],
    'gallery' => [
        'image_title_placeholder' => 'Título de la imagen',
        'image_description_placeholder' => 'Descripción de la imagen',
    ],
    'timeline_entry' => [
        'milestone' => 'Hito:',
        'status_update' => 'Actualización:',
        'stage_transition_separator' => 'a',
    ],
    'timeline_post_update' => [
        'milestone_placeholder' => '¿Qué hito alcanzaron?',
        'status_placeholder' => 'Compartí una actualización con la comunidad…',
    ],
    'post_actions' => [
        'create_project' => 'Crear proyecto',
        'view_project' => 'Ver proyecto',
    ],
    'comment_form' => [
        'body_placeholder' => 'Escribe un comentario...',
        'body_required' => 'El comentario no puede estar vacío.',
        'body_string' => 'El comentario debe ser texto.',
        'body_max' => 'El comentario no puede exceder los :max caracteres.',
        'login_cta' => 'Inicia sesión',
        'login_suffix' => 'para comentar.',
        'publish' => 'Publicar',
    ],
    'comment_textarea' => [
        'body_placeholder' => '¿Qué tienes en mente?',
        'submit' => 'Publicar',
        'a11y' => [
            'attach_file' => 'Adjuntar archivo',
            'your_mood' => 'Tu estado de ánimo',
            'add_your_mood' => 'Agregar tu estado de ánimo',
        ],
        'moods' => [
            'excited' => 'Emocionado',
            'loved' => 'Enamorado',
            'happy' => 'Feliz',
            'sad' => 'Triste',
            'thumbsy' => 'Aprobado',
            'none' => 'No siento nada',
        ],
    ],
];
