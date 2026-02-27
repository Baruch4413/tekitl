import CommentList from '@/components/ui/feed/CommentList'
import CommentForm from '@/components/ui/feed/CommentForm'
import type { Comment } from '@/components/ui/feed/CommentItem'

export type { Comment }

interface PostCommentsProps {
    postId: number
    comments: Comment[]
}

export default function PostComments({ postId, comments }: PostCommentsProps) {
    return (
        <div className="relative mt-4 border-t border-gray-100 pt-4 dark:border-white/5">
            {/* Connector: bridges from post avatar area down to the comment list top */}
            {comments.length > 0 && (
                <div className="absolute -left-8 -top-10 h-14 w-0.5 bg-gray-200 dark:bg-white/10" />
            )}
            <CommentList comments={comments} />
            <div className={comments.length > 0 ? 'mt-6' : ''}>
                <CommentForm postId={postId} />
            </div>
        </div>
    )
}
