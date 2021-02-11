import React, { useEffect, useContext } from "react";
import Page from "./Page";
import StateContext from "../StateContext";
import axios from "axios";
import LoadingDotsIcon from "./LoadingDotsIcon";
import { useImmer } from "use-immer";
import Post from "./Post";
function Home() {
	const appState = useContext(StateContext);
	const [state, setState] = useImmer({
		isLoading: true,
		feed: [],
	});

	useEffect(() => {
		const ourRequest = axios.CancelToken.source();
		async function fetchData() {
			try {
				const response = await axios.post(
					"/getHomeFeed",
					{
						token: appState.user.token,
					},
					{
						cancelToken: ourRequest.token,
					}
				);
				setState((draft) => {
					draft.isLoading = false;
					draft.feed = response.data;
				});
				console.log(state.profileData.counts.postCount);
			} catch (err) {
				console.log(err);
			}
		}
		fetchData();
		return () => {
			ourRequest.cancel();
		};
	}, []);

	if (state.isLoading) {
		return <LoadingDotsIcon />;
	}

	return (
		<Page title="Your Feed">
			{state.feed.length === 0 && (
				<React.Fragment>
					<h2 className="text-center ">
						Hello <strong>{appState.user.username}</strong>, your feed is empty.
					</h2>
					<p className="lead text-muted text-center">
						Your feed displays the latest posts from the people you follow. If
						you don&rsquo;t have any friends to follow that&rsquo;s okay; you
						can use the &ldquo;Search&rdquo; feature in the top menu bar to find
						content written by people with similar interests and then follow
						them.
					</p>{" "}
				</React.Fragment>
			)}

			{state.feed.length > 0 && (
				<React.Fragment>
					<div className="list-group shadow-sm">
						{state.results.map((post) => {
							<Post post={post} key={post._id} />;
						})}
					</div>
				</React.Fragment>
			)}
		</Page>
	);
}

export default Home;
