import { useEffect, useState } from 'react'
import { Form, router } from '@inertiajs/react'
import { ArrowLeftIcon } from 'lucide-react'
import InputError from '@/components/input-error'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { redirect as googleRedirect } from '@/routes/auth/google'
import { store as loginStore } from '@/routes/login'
import { store as registerStore } from '@/routes/register'

type View = 'choose' | 'credentials' | 'register'

export default function LoginModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [view, setView] = useState<View>('choose')

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (!open) setView('choose')
    }

    useEffect(() => {
        const handleLoginRequired = () => setIsOpen(true)
        window.addEventListener('login-required', handleLoginRequired)
        return () => window.removeEventListener('login-required', handleLoginRequired)
    }, [])

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return
            if (event.data?.type === 'auth-success') {
                handleOpenChange(false)
                router.reload()
            }
        }
        window.addEventListener('message', handleMessage)
        return () => window.removeEventListener('message', handleMessage)
    }, [])

    const handleGoogleLogin = () => {
        const width = 500
        const height = 600
        const left = window.screenX + (window.outerWidth - width) / 2
        const top = window.screenY + (window.outerHeight - height) / 2
        const popup = window.open(
            googleRedirect.url() + '?popup=1',
            'login-popup',
            `width=${width},height=${height},left=${left},top=${top}`,
        )
        if (!popup) {
            window.location.href = googleRedirect.url()
        }
    }

    const handleSuccess = () => {
        handleOpenChange(false)
        router.reload()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent>
                {view === 'choose' && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Inicia sesión</DialogTitle>
                            <DialogDescription>
                                Necesitas iniciar sesión para realizar esta acción.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-3">
                            <Button
                                className="w-full"
                                onClick={() => setView('credentials')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                                    <rect width="20" height="16" x="2" y="4" rx="2" />
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                </svg>
                                Continuar con correo y contraseña
                            </Button>
                            <Button
                                className="w-full"
                                onClick={handleGoogleLogin}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4">
                                    <path
                                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                        fill="currentColor"
                                    />
                                </svg>
                                Continuar con Google
                            </Button>
                        </div>
                    </>
                )}

                {view === 'credentials' && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Button
                                    size="icon"
                                    onClick={() => setView('choose')}
                                    className="size-7"
                                >
                                    <ArrowLeftIcon className="size-4" />
                                </Button>
                                Iniciar sesión
                            </DialogTitle>
                            <DialogDescription>
                                Ingresa tu correo y contraseña para continuar.
                            </DialogDescription>
                        </DialogHeader>
                        <Form
                            {...loginStore.form()}
                            options={{ preserveScroll: true, onSuccess: handleSuccess }}
                            className="grid gap-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="login-email">Correo electrónico</Label>
                                        <Input
                                            id="login-email"
                                            type="email"
                                            name="email"
                                            required
                                            autoFocus
                                            autoComplete="email"
                                            placeholder="correo@ejemplo.com"
                                        />
                                        <InputError message={errors.email} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="login-password">Contraseña</Label>
                                        <Input
                                            id="login-password"
                                            type="password"
                                            name="password"
                                            required
                                            autoComplete="current-password"
                                            placeholder="Contraseña"
                                        />
                                        <InputError message={errors.password} />
                                    </div>
                                    <div className="flex items-center gap-x-3">
                                        <Checkbox id="login-remember" name="remember" />
                                        <Label htmlFor="login-remember">Recordarme</Label>
                                    </div>
                                    <Button type="submit" className="w-full" disabled={processing}>
                                        {processing && <Spinner />}
                                        Iniciar sesión
                                    </Button>
                                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                                        ¿No tienes cuenta?{' '}
                                        <button
                                            type="button"
                                            onClick={() => setView('register')}
                                            className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                                        >
                                            Regístrate
                                        </button>
                                    </p>
                                </>
                            )}
                        </Form>
                    </>
                )}

                {view === 'register' && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Button
                                    size="icon"
                                    onClick={() => setView('credentials')}
                                    className="size-7"
                                >
                                    <ArrowLeftIcon className="size-4" />
                                </Button>
                                Crear cuenta
                            </DialogTitle>
                            <DialogDescription>
                                Completa los datos para registrarte.
                            </DialogDescription>
                        </DialogHeader>
                        <Form
                            {...registerStore.form()}
                            options={{ preserveScroll: true, onSuccess: handleSuccess }}
                            className="grid gap-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="register-name">Nombre</Label>
                                        <Input
                                            id="register-name"
                                            type="text"
                                            name="name"
                                            required
                                            autoFocus
                                            autoComplete="name"
                                            placeholder="Tu nombre"
                                        />
                                        <InputError message={errors.name} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="register-email">Correo electrónico</Label>
                                        <Input
                                            id="register-email"
                                            type="email"
                                            name="email"
                                            required
                                            autoComplete="email"
                                            placeholder="correo@ejemplo.com"
                                        />
                                        <InputError message={errors.email} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="register-password">Contraseña</Label>
                                        <Input
                                            id="register-password"
                                            type="password"
                                            name="password"
                                            required
                                            autoComplete="new-password"
                                            placeholder="Contraseña"
                                        />
                                        <InputError message={errors.password} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="register-password-confirmation">Confirmar contraseña</Label>
                                        <Input
                                            id="register-password-confirmation"
                                            type="password"
                                            name="password_confirmation"
                                            required
                                            autoComplete="new-password"
                                            placeholder="Repite la contraseña"
                                        />
                                        <InputError message={errors.password_confirmation} />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={processing}>
                                        {processing && <Spinner />}
                                        Crear cuenta
                                    </Button>
                                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                                        ¿Ya tienes cuenta?{' '}
                                        <button
                                            type="button"
                                            onClick={() => setView('credentials')}
                                            className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                                        >
                                            Inicia sesión
                                        </button>
                                    </p>
                                </>
                            )}
                        </Form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
