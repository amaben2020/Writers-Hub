import React, { useContext, useEffect } from "react";
import DispatchContext from "../DispatchContext";
import { useImmer } from "use-immer";
import axios from "axios";
import { Link } from "react-router-dom";
import Post from "./Post";

const Search = () => {
	const appDispatch = useContext(DispatchContext);
	const [state, setState] = useImmer({
		searchTerm: "",
		results: [],
		show: "neither",
		requestCount: 0,
	});

	useEffect(() => {
		document.addEventListener("keyup", searchKeyboardInput);
		return () => {
			document.removeEventListener("keyup", searchKeyboardInput);
		};
	}, []);

	//27 means escape key
	function searchKeyboardInput(e) {
		if (e.keyCode == 27) {
			appDispatch({ type: "searchIsClosed" });
		}
	}

	//To delay keyboard press
	useEffect(() => {
		if (state.searchTerm.trim()) {
			setState((draft) => {
				draft.show = "loading";
			});
			const delay = setTimeout(() => {
				setState((draft) => {
					draft.requestCount++;
				});
			}, 600);

			return () => clearTimeout(delay);
		} else {
			setState((draft) => {
				draft.show = "neither";
			});
		}
	}, [state.searchTerm]);

	useEffect(() => {
		if (state.requestCount) {
			const ourResponse = axios.CancelToken.source();
			async function postSearchTerm() {
				try {
					const response = await axios.post(
						"/search",
						{ searchTerm: state.searchTerm },
						{ cancelToken: ourResponse.token }
					);
					console.log(response.data);
					setState((draft) => {
						draft.results = response.data;
						draft.show = "results";
					});
					console.log(state.results);
				} catch (e) {
					console.log("error dey o");
				}
			}
			postSearchTerm();
			return () => {
				ourResponse.cancel();
			};
		}
	}, [state.requestCount]); //state.requestCount is a dep cos we always wanna watch for it
	function handleInput(e) {
		const value = e.target.value;
		setState((draft) => {
			draft.searchTerm = value;
		});
	}

	return (
		<div>
			<div className="search-overlay">
				<div className="search-overlay-top shadow-sm">
					<div className="container container--narrow">
						<label htmlFor="live-search-field" className="search-overlay-icon">
							<i className="fas fa-search"></i>{" "}
						</label>{" "}
						<input
							onChange={handleInput}
							autoFocus
							type="text"
							autoComplete="off"
							id="live-search-field"
							className="live-search-field"
							placeholder="What are you interested in?"
						/>{" "}
						<span
							onClick={() => appDispatch({ type: "searchIsClosed" })}
							className="close-live-search"
						>
							<i className="fas fa-times-circle"></i>{" "}
						</span>{" "}
					</div>
				</div>

				{/* <div className="search-overlay-bottom"> */}

				<div className="container container--narrow py-3">
					<div
						className={
							"circle-loader " +
							(state.show == "loading" ? "circle-loader--visible" : "")
						}
					></div>
					<div
						className={
							"live-search-results " +
							(state.show == "results" ? "live-search-results--visible" : "")
						}
					>
						<div className="list-group shadow-sm">
							<div className="list-group-item active">
								<strong>Search Results</strong> ({state.results.length}{" "}
								{state.results.length > 1 ? "items" : "item"} found)
							</div>
							{state.results.map((post) => {
								return (
									<Post
										post={post}
										key={post._id}
										onClick={() => appDispatch({ type: "searchIsClosed" })}
									/>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Search;
