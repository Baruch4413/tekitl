import CommentItem, { type Comment } from '@/components/ui/feed/CommentItem'

interface CommentListProps {
    comments: Comment[]
}

export default function CommentList({ comments }: CommentListProps) {
    if (comments.length === 0) {
        return null
    }

    return (
        <div className="flow-root">
            <ul role="list" className="-mb-6">
                {comments.map((comment, index) => (
                    <CommentItem
                        key={comment.id}
                        comment={comment}
                        isLast={index === comments.length - 1}
                    />
                ))}
            </ul>
        </div>
    )
}
