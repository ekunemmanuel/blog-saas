import { user } from "firebase-functions/v1/auth";
export interface Login {
  email: string;
  password: string;
}

export interface SignUp extends Login {
  name: string;
}

export interface User {
  id: string;
  displayName: string;
  email: string;
  siteIds?: string[];
  postIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Site {
  id?: string;
  name: string;
  subdirectory: string;
  description: string;
  userId: string;
  imageUrl?: string;
  imageId?: string;
  createdAt?: string;
  updatedAt?: string;
  postIds?: string[];
}

export interface Post {
  id?: string; // post id
  title: string; // post title
  description: string; // short description
  content: string; // long description
  coverImage: string; // image url
  slug: string; // url
  createdAt?: string; // created date
  updatedAt?: string; // updated date
  userId: string; // user id
  siteId: string; // site id
  imageId: string; // image id to locate file in storage
  status: boolean;
}
