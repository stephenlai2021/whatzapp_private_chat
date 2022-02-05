/** @type {import('@sveltejs/kit').Config} */
import vercel from "@sveltejs/adapter-auto";

const config = {
  kit: {
    target: "#svelte",
    adapter: vercel(),
  },
};

export default config
