import Post from '../model/post';
import PostWithInteractions from '../model/postWithInteractions';

export interface Query {
  profileId?: string;
  id?: string;
}

export default interface IPostDataPort {
  savePost: (post: Post) => Promise<string | undefined>;
  likePost: (post: Post, accountId: string) => Promise<number>;
  sharePost: (createdPostId: string, sharedPostId: string) => Promise<number>;
  replyToPost: (createdPostId: string, sharedPostId: string) => Promise<number>;
  delete: (query: Query) => Promise<number>;
  get: (query: Query) => Promise<Post[]>;
  getWithInteractions: (query: Query) => Promise<PostWithInteractions[]>;
}
