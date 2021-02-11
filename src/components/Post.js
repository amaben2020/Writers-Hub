import React from "react";
import { Link } from "react-router-dom";
export default function Post({ post, onClick, noAuthor }) {
	const date = new Date(post.createdDate);
	const dateFormatted = `${
		date.getMonth() + 1
	}/${date.getDate()}/${date.getFullYear()}`;
	return (
		<div>
			<Link
				onClick={onClick}
				to={`/post/${post._id}`}
				className="list-group-item list-group-item-action"
			>
				<img className="avatar-tiny" src={post.author.avatar} />{" "}
				<strong>{post.title}</strong>{" "}
				<span className="text-muted small">
					by{" "}
					{noAuthor && <React.Fragment>{post.author.username}</React.Fragment>}{" "}
					on {dateFormatted}{" "}
				</span>
			</Link>
		</div>
	);
}
