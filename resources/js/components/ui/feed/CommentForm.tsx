import { Form, usePage } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import type { Auth } from '@/types/auth'

interface CommentFormProps {
    storeUrl: string
    onSuccess?: () => void
}

export default function CommentForm({ storeUrl, onSuccess }: CommentFormProps) {
    const { auth } = usePage<{ auth?: Auth }>().props

    if (!auth?.user) {
        return (
            <p className="text-sm text-gray-500 dark:text-gray-400">
                <Button
                    variant="link"
                    className="h-auto p-0"
                    onClick={() => window.dispatchEvent(new CustomEvent('login-required'))}
                >
                    Inicia sesión
                </Button>{' '}
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
                action={storeUrl}
                method="post"
                resetOnSuccess
                options={{ preserveScroll: true, onSuccess }}
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
                            <Button
                                type="submit"
                                disabled={processing}
                                size="sm"
                                className="shrink-0"
                            >
                                Publicar
                            </Button>
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
