import { type NextPage } from "next";
import Head from "next/head";
import { signIn, useSession } from "next-auth/react";

import { api } from "@/utils/api";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "@/components/loading";
import { useState } from "react";
import toast from "react-hot-toast";
import { PageLayout } from "@/components/layout";
import { PostView } from "@/components/post";

function CreatePost() {
  const { data: sessionData } = useSession();
  const { user } = sessionData!;
  const [input, setInput] = useState("");
  const ctx = api.useContext();
  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      console.log(e.data);
      const errorMessage = e.data?.zodError?.fieldErrors.content;

      if (errorMessage) {
        toast.error(errorMessage.join(", "));
      } else {
        toast.error("Faild to post! Please try again later.");
      }
    },
  });

  return (
    <div className="flex gap-3 w-full">
      <Image
        src={user.image!}
        alt="Your profile picture"
        width={48}
        height={48}
        className="rounded-full"
      />
      <input
        type="text"
        value={input}
        placeholder="Type emojis"
        className=" bg-transparent grow outline-none"
        onChange={(e) => setInput(e.target.value)}
        onKeyUp={(e) => { if (e.key === "Enter") { mutate({ content: input }); } }}
        disabled={isPosting}
      />
      <button
        className=" w-20 bg-blue-400 hover:bg-blue-500 active:bg-blue-600 relative"
        onClick={() => mutate({ content: input })}
        disabled={isPosting}
      >
        {
          isPosting ? <div className=" absolute top-2 right-4"><LoadingSpinner /></div> : "Chirp!"
        }
      </button>
    </div>
  );
}

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();
  if (postsLoading) return <LoadingPage />;
  if (!data) return <div>No data</div>;
  return (
    <div className="flex flex-col">
      {data.map((post) => (
        <PostView {...post} key={post.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  // Start fetching
  api.posts.getAll.useQuery();

  const { data: sessionData, status } = useSession();

  if (status === "loading") return <div />;

  return (
    <>
      <Head>
        <title>Profile</title>
      </Head>
      <PageLayout>
        <div className="border-b border-slate-400 p-4 flex justify-center">
          {sessionData
            ? <CreatePost />
            : <button onClick={() => void signIn()}>Sign in</button>}
        </div>
        <Feed />
      </PageLayout>

    </>
  );
};

export default Home;
