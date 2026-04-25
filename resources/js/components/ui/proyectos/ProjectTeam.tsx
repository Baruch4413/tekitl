import { type ProjectRole, type Volunteer } from '@/components/ui/proyectos/ProjectRoles'

interface TeamMember extends Volunteer {
    roleTitle: string
}

interface ProjectTeamProps {
    roles: ProjectRole[]
}

export default function ProjectTeam({ roles }: ProjectTeamProps) {
    const members: TeamMember[] = roles.flatMap((role) =>
        role.volunteers.map((v) => ({ ...v, roleTitle: role.title })),
    )

    if (members.length === 0) {
        return null
    }

    return (
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Equipo del proyecto</h3>
            <ul
                role="list"
                className="mt-4 grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4 md:grid-cols-5"
            >
                {members.map((member) => (
                    <li key={member.id} className="text-center">
                        {member.avatarUrl ? (
                            <img
                                alt=""
                                src={member.avatarUrl}
                                className="mx-auto size-14 rounded-full object-cover outline outline-1 -outline-offset-1 outline-black/5 dark:outline-white/10"
                            />
                        ) : (
                            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-indigo-100 text-xl font-semibold text-indigo-600 outline outline-1 -outline-offset-1 outline-black/5 dark:bg-indigo-500/20 dark:text-indigo-400 dark:outline-white/10">
                                {member.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <p className="mt-2 text-xs font-semibold text-gray-900 dark:text-white">{member.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{member.roleTitle}</p>
                    </li>
                ))}
            </ul>
        </div>
    )
}
