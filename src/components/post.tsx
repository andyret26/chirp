import { type RouterOutputs } from "@/utils/api";
import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
export function PostView(props: PostWithUser) {
  const {
    content, author, creaedAt, id,
  } = props;
  const TimeFromX = dayjs(creaedAt).fromNow();

  return (
    <div className="flex  border-b border-slate-400 p-4">
      <Link href={`/@${author.name}`}>
        <Image
          src={author.image}
          alt={`${author.name}'s profile picture`}
          width={48}
          height={48}
          className="rounded-full mx-4"
        />
      </Link>
      <Link href={`/post/${id}`}>
        <div className=" flex flex-col">
          <div className="flex text-gray-400 gap-1">
            <Link href={`/@${author.name}`}><span>{`@${author.name}`}</span></Link>
            ·
            <span>{TimeFromX}</span>
          </div>
          <span>{content}</span>
        </div>
      </Link>
    </div>
  );
}
