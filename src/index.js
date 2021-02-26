import React from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import {
  useQuery,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "react-query";
import "./style.css";
// import { ReactQueryDevtools } from "react-query/devtools";

const queryClient = new QueryClient();

function App() {
  const [postId, setPostId] = React.useState(-1);

  return (
    <QueryClientProvider client={queryClient}>
      <main>
        <p>
          As you visit the posts below, you will notice them in a loading state
          the first time you load them. However, after you return to this list
          and click on any posts you have already visited again, you will see
          them load instantly and background refresh right before your eyes!{" "}
          <strong>
            (You may need to throttle your network speed to simulate longer
            loading sequences)
          </strong>
        </p>
        {postId > -1 ? (
          <Post postId={postId} setPostId={setPostId} />
        ) : (
          <Posts setPostId={setPostId} />
        )}
        <ReactQueryDevtools initialIsOpen />
      </main>
    </QueryClientProvider>
  );
}

function usePosts() {
  return useQuery("posts", async () => {
    const { data } = await axios.get(
      "https://jsonplaceholder.typicode.com/posts"
    );
    return data;
  });
}

function Posts({ setPostId }) {
  const queryClient = useQueryClient();
  const { status, data, error, isFetching } = usePosts();

  return (
    <>
      <h1>Posts</h1>

      {status === "loading" ? (
        <h1>"Loading..."</h1>
      ) : status === "error" ? (
        <code>Error: {error.message}</code>
      ) : (
        <nav>
          <ul className="posts-list">
            {data.map((post) => (
              <li key={post.id}>
                <button
                  onClick={() => setPostId(post.id)}
                  className={
                    queryClient.getQueryData(["post", post.id]) && "visited"
                  }
                >
                  {post.title}
                </button>
              </li>
            ))}
          </ul>

          {isFetching && "Background Updating..."}
        </nav>
      )}
    </>
  );
}

const getPostById = async (id) => {
  const { data } = await axios.get(
    `https://jsonplaceholder.typicode.com/posts/${id}`
  );
  return data;
};

function usePost(postId) {
  return useQuery(["post", postId], () => getPostById(postId), {
    enabled: !!postId,
  });
}

function Post({ postId, setPostId }) {
  const { status, data, error, isFetching } = usePost(postId);

  return (
    <article>
      {!postId || status === "loading" ? (
        <h1>"Loading..."</h1>
      ) : status === "error" ? (
        <code>Error: {error.message}</code>
      ) : (
        <>
          <h1>{data.title}</h1>
          <p>{data.body}</p>
          {isFetching && "Background Updating..."}
        </>
      )}
      <button onClick={() => setPostId(-1)}>← Back</button>
    </article>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
