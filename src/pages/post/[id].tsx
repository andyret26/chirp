import { type NextPage } from "next";
import Head from "next/head";

const Post: NextPage = () => {
  const x = "hi";
  return (
    <>
      <Head>
        <title>Post</title>
      </Head>
      <main className="flex justify-center h-screen">
        <div>
          <p>Post</p>
        </div>
      </main>
    </>
  );
};

export default Post;
