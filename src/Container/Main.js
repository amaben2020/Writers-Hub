import React, { useEffect, Suspense } from "react";
import { useImmerReducer } from "use-immer";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import Axios from "axios";
//State/Contexts
import DispatchContext from "../DispatchContext";
import StateContext from "../StateContext";
//Components
import Terms from "../components/Terms";
import Home from "../components/Home";
import FlashMessages from "../components/FlashMessages";
import Profile from "../components/Profile";
import Footer from "../components/Footer";
import Header from "../components/Header";
import HomeGuest from "../components/HomeGuest";
import About from "../components/About";
import EditPost from "../components/EditPost";
import NotFound from "../components/NotFound";
import Search from "./../components/Search";
import CreatePost from "../components/CreatePost";
import LoadingDotsIcon from "../components/LoadingDotsIcon";
const Chat = React.lazy(() => import("../components/Chat"));
// const CreatePost = React.lazy(() => import("../components/CreatePost"));
const ViewSinglePost = React.lazy(() => import("../components/ViewSinglePost"));
Axios.defaults.baseURL = "http://localhost:8082";
function Main() {
	const initialState = {
		loggedIn: Boolean(localStorage.getItem("complexappToken")),
		flashMessages: [],
		user: {
			token: localStorage.getItem("complexappToken"),
			username: localStorage.getItem("complexappUsername"),
			avatar: localStorage.getItem("complexappAvatar"),
		},
		isSearchOpen: false,
		isChatOpen: false,
		unreadChatCount: 0,
	};
	function ourReducer(draft, action) {
		switch (action.type) {
			// FOR
			case "login":
				draft.loggedIn = true;
				draft.user = action.data;
				return;
			case "logout":
				draft.loggedIn = false;
				return;
			case "flashMessage":
				draft.flashMessages.push(action.value);
				return;
			case "searchIsOpen":
				draft.isSearchOpen = true;
				return;
			case "searchIsClosed":
				draft.isSearchOpen = false;
				return;
			case "toggleChat":
				draft.isChatOpen = !draft.isChatOpen;
				return;
			case "closeChat":
				draft.isChatOpen = false;
				return;
			case "incrementUnreadChatCount":
				draft.unreadChatCount++;
				return;
			case "clearUnreadChatCount":
				draft.unreadChatCount = 0;
				return;
		}
	}

	const [state, dispatch] = useImmerReducer(ourReducer, initialState);

	useEffect(() => {
		if (state.loggedIn) {
			localStorage.setItem("complexappToken", state.user.token);
			localStorage.setItem("complexappUsername", state.user.username);
			localStorage.setItem("complexappAvatar", state.user.avatar);
		} else {
			localStorage.removeItem("complexappToken");
			localStorage.removeItem("complexappUsername");
			localStorage.removeItem("complexappAvatar");
		}
	}, [state.loggedIn]); // only update when the logged in cahnge occurs

	useEffect(() => {
		if (state.loggedIn) {
			const ourResponse = Axios.CancelToken.source();
			async function postSearchTerm() {
				try {
					const response = await Axios.post(
						"/checkToken",
						{ token: state.user.token },
						{ cancelToken: ourResponse.token }
					);
					console.log(response.data);
					if (!response.data) {
						//if server sends back false
						dispatch({ type: "logout" });
						dispatch({
							type: "flashMessage",
							value: "Session expired! Kindly login again",
						});
					}
				} catch (e) {
					console.log("error dey o");
				}
			}
			postSearchTerm();
			return () => {
				ourResponse.cancel();
			};
		}
	}, []);

	return (
		<StateContext.Provider value={state}>
			<DispatchContext.Provider value={dispatch}>
				<Router>
					<FlashMessages messages={state.flashMessages} />
					<Header />
					<Suspense fallback={<LoadingDotsIcon />}>
						<Switch>
							<Route path="/" exact>
								{state.loggedIn ? <Home /> : <HomeGuest />}
							</Route>
							<Route path="/post/:id" exact>
								<ViewSinglePost />
							</Route>
							<Route path="/post/:id/edit" exact>
								<EditPost />
							</Route>
							<Route path="/profile/:username">
								<Profile />
							</Route>

							<Route path="/create-post">
								<CreatePost />
							</Route>

							<Route path="/about-us">
								<About />
							</Route>
							<Route path="/terms">
								<Terms />
							</Route>
							<Route>
								<NotFound />
							</Route>
						</Switch>
					</Suspense>
					<CSSTransition
						in={state.isSearchOpen}
						classNames="search-overlay"
						timeout={330}
						unmountOnExit
					>
						{state.isSearchOpen ? <Search /> : ""}
					</CSSTransition>
					<Suspense fallback="">{state.loggedIn && <Chat />}</Suspense>
					<Footer />
				</Router>
			</DispatchContext.Provider>
		</StateContext.Provider>
	);
}
export default Main;
