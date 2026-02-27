import { Form, Link, usePage } from '@inertiajs/react'
import { store } from '@/actions/App/Http/Controllers/CommentController'
import type { Auth } from '@/types/auth'

interface CommentFormProps {
    postId: number
}

export default function CommentForm({ postId }: CommentFormProps) {
    const { auth } = usePage<{ auth?: Auth }>().props

    if (!auth?.user) {
        return (
            <p className="text-sm text-gray-500 dark:text-gray-400">
                <Link
                    href="/auth/login"
                    className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                >
                    Inicia sesión
                </Link>{' '}
                para comentar.
            </p>
        )
    }

    const user = auth.user

    return (
        <div className="flex items-start gap-x-3">
            {user.avatar_url ? (
                <img
                    alt=""
                    src={user.avatar_url}
                    className="size-8 shrink-0 rounded-full bg-gray-100 outline -outline-offset-1 outline-black/5 dark:bg-gray-800 dark:outline-white/10"
                />
            ) : (
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 outline -outline-offset-1 outline-black/5 dark:bg-indigo-900 dark:text-indigo-300 dark:outline-white/10">
                    {user.name.charAt(0).toUpperCase()}
                </span>
            )}

            <Form
                action={store.url(postId)}
                method="post"
                resetOnSuccess
                options={{ preserveScroll: true }}
                className="min-w-0 flex-1"
            >
                {({ errors, processing }) => (
                    <div>
                        <div className="flex items-center gap-x-2">
                            <div className="flex-1 rounded-full bg-gray-100 px-4 py-1.5 dark:bg-white/5">
                                <input
                                    type="text"
                                    name="body"
                                    placeholder="Escribe un comentario..."
                                    className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-white dark:placeholder:text-gray-500"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="shrink-0 text-sm font-semibold text-indigo-600 hover:text-indigo-500 disabled:opacity-50 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                                Publicar
                            </button>
                        </div>
                        {errors.body && (
                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.body}</p>
                        )}
                    </div>
                )}
            </Form>
        </div>
    )
}
