import Head from "next/head";
import { api } from "@/utils/api";
import {
  type GetServerSidePropsContext, type NextPage,
} from "next";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { prisma } from "@/server/db";
import { appRouter } from "@/server/api/root";
import superjson from "superjson";
import { LoadingPage } from "@/components/loading";
import { PageLayout } from "@/components/layout";
import Image from "next/image";
import { PostView } from "@/components/post";

const ProfileFeed = (props: { userId: string }) => {
  const { data: posts, isLoading } = api.posts.getPostsByUserId.useQuery({ userId: props.userId });
  if (isLoading) return <LoadingPage />;
  if (!posts || posts.length === 0) return <div>User has no posts</div>;
  return (
    <div className=" flex flex-col">
      {posts.map((post) => (
        <PostView {...post} key={post.id} />
      ))}
    </div>
  );
};

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data: userData, isLoading } = api.profile.getUserByUsername.useQuery({ username });
  if (isLoading) return <LoadingPage />;
  if (!userData) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{userData.name}</title>
      </Head>
      <PageLayout>
        <div className=" h-36 border-slate-400 bg-slate-600 relative">
          <Image
            src={userData.image}
            alt={`${userData.name} profile image`}
            width={100}
            height={100}
            className=" -mb-[50px] absolute bottom-0 left-0 ml-4 rounded-full border-[3px] border-black"
          />
        </div>
        <div className="h-[50px]" />
        <div className=" p-4 text-2xl font-bold">
          {`@${userData.name}`}
        </div>
        <div className="border-b border-slate-400" />
        <ProfileFeed userId={userData.id} />

      </PageLayout>
    </>
  );
};

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ slug: string }>,
) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, session: null },
    transformer: superjson,
  });
  const slug = context.params?.slug as string;
  const username = slug.replace("@", "");
  /*
   * Prefetching the `post.byId` query here.
   * `prefetch` does not return the result and never throws - if you need that behavior,
   *  use `fetch` instead.
   */
  await helpers.profile.getUserByUsername.prefetch({ username });
  // Make sure to return { props: { trpcState: helpers.dehydrate() } }
  return {
    props: {
      trpcState: helpers.dehydrate(),
      username,
    },
  };
}

export default ProfilePage;
