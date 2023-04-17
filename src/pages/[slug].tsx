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

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data: userData, isLoading } = api.profile.getUserByUsername.useQuery({ username });
  if (isLoading) return <LoadingPage />;
  if (!userData) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{userData.name}</title>
      </Head>
      <main className="flex justify-center h-screen">
        <div>
          <p>Profile</p>
          <p>{userData.name}</p>
        </div>
      </main>
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
