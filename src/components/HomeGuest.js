import React, { useEffect, useContext } from "react";
import Page from "./Page";
import axios from "axios";
import { useImmerReducer } from "use-immer";
import { CSSTransition } from "react-transition-group";
import StateDispatch from "./../DispatchContext";

function HomeGuest() {
	const appDispatch = useContext(StateDispatch);
	const initialState = {
		username: {
			value: "",
			hasErrors: false,
			message: "",
			isUnique: "false",
			checkCount: 0, //Information of username to be sent to server
		},
		email: {
			value: "",
			hasErrors: false,
			message: "",
			isUnique: "false",
			checkCount: 0, //Information of user email to be sent to server
		},
		password: {
			value: "",
			hasErrors: false,
			message: "",
		},
		submitCount: 0, //Total Information to be sent to server
	};

	function ourReducer(draft, action) {
		switch (action.type) {
			case "usernameImmediately": //What happens immediately user types in
				draft.username.hasErrors = false; //false initially
				draft.username.value = action.value; //The user's input
				//checking if username is over 30 characters long (it shouldn't)
				if (draft.username.value.length > 30) {
					draft.username.hasErrors = true; //there's an error
					draft.username.message = "Username is over 30 characters long";
				}
				//values that arent alphanumeric a-z,0-9 would trigger hasErrors
				if (
					draft.username.value &&
					!/^([a-zA-Z0-9]+)$/.test(draft.username.value)
				) {
					draft.username.hasErrors = true;
					draft.username.message =
						"Username can only contain letters and numbers";
				}
				return;
			case "usernameAfterDelay": //What happens after user types in i.e 8ms
				//if username value is less than 3
				if (draft.username.value.length < 3) {
					draft.username.hasErrors = true;
					draft.username.message = "Username must be at least 3 characters";
				}
				//Only if there are no errors do we wanna send the information to server
				if (!draft.username.hasErrors && !action.noRequest) {
					//remember that noRequest = true
					draft.username.checkCount++;
				}
				return;
			case "emailImmediately":
				draft.email.hasErrors = false;
				draft.email.value = action.value;
				return;
			case "emailAfterDelay":
				//If email is invalid /\S+@\S+\.\S+/
				if (!/^\S+@\S+\.\S+$/.test(draft.email.value)) {
					draft.email.hasErrors = true; //There's a bug in the backend
					draft.email.message = "You must provide a valid email address";
				}
				//If email has errors, dont send to the backend
				if (!draft.email.hasErrors && !action.noRequest) {
					draft.email.checkCount++;
				}

				return;
			case "passwordImmediately": //Error message that renders immediately you type
				draft.password.hasErrors = false;
				draft.password.value = action.value;
				if (draft.password.value.length > 50) {
					draft.password.hasErrors = true;
					draft.password.message =
						"Password cannot exceed 50 characters in length";
				}
				return;
			case "passwordAfterDelay":
				//Checks for the minimun length of password after typing
				if (draft.password.value.length < 12) {
					draft.password.hasErrors = true;
					draft.password.message = "Password must be at least 12 characters";
				}
				return;
			case "usernameUniqueResults": //username must be unique,if user exists,hasError=true
				if (action.value) {
					//i.e username is in database
					draft.username.hasErrors = true;
					draft.username.isUnique = false; //the username is not unique
					draft.username.message = "This username is already taken";
				} else {
					draft.username.isUnique = true;
				}
				return;
			case "emailUniqueResults": //email must be unique,if email exists,hasError=true
				if (action.value) {
					draft.email.hasErrors = true;
					draft.email.isUnique = false;
					draft.email.message = "That email is already being used";
				} else {
					draft.email.isUnique = true;
				}
				return;
			case "submitForm": //Action that occurs when you handleSubmit
				//Conditions that check if EVERYTHING works perfectly before submitting
				if (
					!draft.username.hasErrors &&
					draft.username.isUnique &&
					!draft.email.hasErrors &&
					draft.email.isUnique &&
					!draft.password.hasErrors
				) {
					draft.submitCount++;
				}
				return;
		}
	}

	const [state, dispatch] = useImmerReducer(ourReducer, initialState);

	//Working on a delay timer for USERNAME; we use Use Effect for effect change monitoring
	useEffect(() => {
		if (state.username.value) {
			const delay = setTimeout(
				() => dispatch({ type: "usernameAfterDelay" }),
				800
			);

			// THIS CLEANUP FN CLEARS THE TIMEOUT
			return () => clearTimeout(delay);
		}
	}, [state.username.value]);

	useEffect(() => {
		if (state.email.value) {
			const delay = setTimeout(
				() => dispatch({ type: "emailAfterDelay" }),
				800
			);

			// THIS CLEANUP FN CLEARS THE TIMEOUT
			return () => clearTimeout(delay);
		}
	}, [state.email.value]);

	//This useEffect watches the password input for changes
	useEffect(() => {
		if (state.password.value) {
			const delay = setTimeout(
				() => dispatch({ type: "passwordAfterDelay" }),
				800
			);
			// THIS CLEANUP FN CLEARS THE TIMEOUT
			return () => clearTimeout(delay);
		}
	}, [state.password.value]);

	// UseEffect that watches Checkcount (sent username) for changes i.e does it exist?
	useEffect(() => {
		if (state.username.checkCount) {
			const ourResponse = axios.CancelToken.source();
			async function postUsername() {
				try {
					const response = await axios.post(
						"/doesUsernameExist",
						{ username: state.username.value },
						{ cancelToken: ourResponse.token }
					);
					console.log(response.data);
					//Instead of setState, you dispatch the 'usernameUniqueResults' action
					dispatch({ type: "usernameUniqueResults", value: response.data });
				} catch (e) {
					console.log("error dey o");
				}
			}
			postUsername();
			return () => {
				ourResponse.cancel();
			};
		}
	}, [state.username.checkCount]);

	// UseEffect that watches Checkcount (sent email) for changes i.e does it exist?
	useEffect(() => {
		if (state.email.checkCount) {
			const ourResponse = axios.CancelToken.source();
			async function postEmail() {
				try {
					const response = await axios.post(
						"/doesEmailExist",
						{ email: state.email.value },
						{ cancelToken: ourResponse.token }
					);
					console.log(response.data);
					//Instead of setState, you dispatch the 'usernameUniqueResults' action
					dispatch({ type: "emailUniqueResults", value: response.data });
					console.log(state.email.value);
				} catch (e) {
					console.log("error dey o");
				}
			}
			postEmail();
			return () => {
				ourResponse.cancel();
			};
		}
	}, [state.email.checkCount]);

	async function handleSubmit(e) {
		e.preventDefault();
		dispatch({ type: "usernameImmediately", value: state.username.value });
		dispatch({
			type: "usernameAfterDelay",
			value: state.username.value,
			noRequest: true,
		});
		dispatch({
			type: "emailImmediately",
			value: state.username.value,
			noRequest: true,
		});
		dispatch({ type: "emailAfterDelay", value: state.username.value });
		dispatch({ type: "submitForm" });
	}

	//This useEffect submits the whole stuff
	// UseEffect that watches Checkcount (sent username) for changes i.e does it exist?
	useEffect(() => {
		if (state.submitCount) {
			const ourResponse = axios.CancelToken.source();
			async function onSubmit() {
				try {
					const response = await axios.post(
						"/register",
						{ username: state.username.value },
						{ email: state.email.value },
						{ password: state.password.value },
						{ cancelToken: ourResponse.token }
					);
					console.log(response.data);
					//Use the AppWide dispatch to log users in
					appDispatch({ type: "/login", data: response.data });
					appDispatch({
						type: "flashMessage",
						value: "Welcome to the best app ever",
					});
				} catch (e) {
					console.log("error dey o");
				}
			}
			onSubmit();
			return () => {
				ourResponse.cancel();
			};
		}
	}, [state.submitCount]);

	return (
		<Page title="Welcome!" wide={true}>
			<div className="row align-items-center">
				<div className="col-lg-7 py-3 py-md-5">
					<h1 className="display-3">Remember Writing?</h1>
					<p className="lead text-muted">
						Are you sick of short tweets and impersonal &ldquo;shared&rdquo;
						posts that are reminiscent of the late 90&rsquo;s email forwards? We
						believe getting back to actually writing is the key to enjoying the
						internet again.
					</p>
				</div>
				<div className="col-lg-5 pl-lg-5 pb-3 py-lg-5">
					<form onSubmit={handleSubmit}>
						<div className="form-group">
							<label htmlFor="username-register" className="text-muted mb-1">
								<small>Username</small>
							</label>
							<input
								onChange={(e) =>
									dispatch({
										type: "usernameImmediately",
										value: e.target.value,
									})
								}
								id="username-register"
								name="username"
								className="form-control"
								type="text"
								placeholder="Pick a username"
								autoComplete="off"
							/>
							{/**The hasErrors div and component is rendered by the transition group */}
							<CSSTransition
								in={state.username.hasErrors}
								timeout={330}
								classNames="liveValidationMessage"
								unmountOnExit
							>
								<div className="alert alert-danger small liveValidateMessage">
									{state.username.message}
								</div>
							</CSSTransition>
						</div>
						<div className="form-group">
							<label htmlFor="email-register" className="text-muted mb-1">
								<small>Email</small>
							</label>

							<input
								// onChange={(e) => setEmail(e.target.value)}
								onChange={(e) =>
									dispatch({ type: "emailImmediately", value: e.target.value })
								}
								id="email-register"
								name="email"
								className="form-control"
								type="text"
								placeholder="you@example.com"
								autoComplete="off"
							/>
							{/**The hasErrors div and component is rendered by the transition group */}
							<CSSTransition
								in={state.email.hasErrors}
								timeout={330}
								classNames="liveValidationMessage"
								unmountOnExit
							>
								<div className="alert alert-danger small liveValidateMessage">
									{state.email.message}
								</div>
							</CSSTransition>
						</div>
						<div className="form-group">
							<label htmlFor="password-register" className="text-muted mb-1">
								<small>Password</small>
							</label>
							<input
								onChange={(e) =>
									dispatch({
										type: "passwordImmediately",
										value: "e.target.value",
									})
								}
								id="password-register"
								name="password"
								className="form-control"
								type="password"
								placeholder="Create a password"
							/>
							{/**The hasErrors div and component is rendered by the transition group */}
							<CSSTransition
								in={state.password.hasErrors}
								timeout={330}
								classNames="liveValidationMessage"
								unmountOnExit
							>
								<div className="alert alert-danger small liveValidateMessage">
									{state.password.message}
								</div>
							</CSSTransition>
						</div>
						<button
							type="submit"
							className="py-3 mt-4 btn btn-lg btn-success btn-block"
						>
							Sign up for ComplexApp
						</button>
					</form>
				</div>
			</div>
		</Page>
	);
}

export default HomeGuest;
