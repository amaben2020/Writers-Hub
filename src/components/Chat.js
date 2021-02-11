import React, { useContext, useEffect, useRef } from "react";
import StateContext from "./../StateContext";
import io from "socket.io-client";
import DispatchContext from "./../DispatchContext";
import { useImmer } from "use-immer";
import { Link } from "react-router-dom";
export default function Chat() {
	const appState = useContext(StateContext);
	const chatLog = useRef(null);
	const appDispatch = useContext(DispatchContext);
	const socket = io("http://localhost:8082");
	const chatField = useRef(null);
	const [state, setState] = useImmer({
		fieldValue: "",
		chatMessages: [],
		message: "",
	});
	//run whenever the chat field or window is opened
	useEffect(() => {
		if (appState.isChatOpen) {
			chatField.current.focus();
			appDispatch({ type: "clearUnreadChatCount" });
		}
	}, [appState.isChatOpen]);

	function handleFieldChange(e) {
		e.preventDefault();
		const value = e.target.value;
		setState((draft) => {
			draft.fieldValue = value;
		});
	}
	//scroll up when messages fill the window
	useEffect(() => {
		if (state.chatMessages.length && !appState.isChatOpen) {
			appDispatch({ type: "incrementUnreadChatCount" });
		}

		chatLog.current.scrollTop = chatLog.current.scrollHeight;
	}, [state.chatMessages]);

	useEffect(() => {
		socket.on("chatFromServer", (message) => {
			setState((draft) => {
				draft.chatMessages.push(message);
			});
		});
	}, []);

	function handleSubmit(e) {
		e.preventDefault();
		socket.emit("chatFromBrowser", {
			message: state.fieldValue,
			token: appState.user.token,
		});
		setState((draft) => {
			draft.fieldValue = "";
			draft.chatMessages.push({
				message: state.fieldValue,
				username: appState.user.username,
				avatar: appState.user.avatar,
			});
		});
	}

	console.log(state.chatMessages);

	return (
		<div
			id="chat-wrapper"
			className={
				"chat-wrapper  shadow border-top border-left border-right " +
				(appState.isChatOpen ? "chat-wrapper--is-visible" : "")
			}
		>
			<div className="chat-title-bar bg-primary">
				Chat
				<span
					onClick={() => appDispatch({ type: "toggleChat" })}
					className="chat-title-bar-close"
				>
					<i className="fas fa-times-circle"></i>
				</span>
			</div>
			<div id="chat" className="chat-log" ref={chatLog}>
				{state.chatMessages.map((message, index) => {
					if (message.username == appState.user.username) {
						return (
							<Link to={`/profile/${message.username}`}>
								<div key={index} className="chat-self">
									<div className="chat-message">
										<div className="chat-message-inner">{message.message}</div>
									</div>

									<img
										className="chat-avatar avatar-tiny"
										src={message.avatar}
									/>
								</div>
							</Link>
						);
					}
				})}

				{state.chatMessages.map((message, index) => {
					if (message.username == !appState.user.username) {
						return (
							<div className="chat-other">
								<Link to={`/profile/${message.username}`}>
									<img className="avatar-tiny" src={message.avatar} />
								</Link>
								<div className="chat-message">
									<div className="chat-message-inner">
										<a href="#">
											<strong>{message.username}</strong>
										</a>
										{message.message}
									</div>
								</div>
							</div>
						);
					}
				})}
			</div>
			<form
				onSubmit={handleSubmit}
				id="chatForm"
				className="chat-form border-top"
			>
				<input
					value={state.fieldValue}
					ref={chatField}
					onChange={handleFieldChange}
					type="text"
					className="chat-field"
					id="chatField"
					placeholder="Type a message…"
					autoComplete="off"
				/>
			</form>
		</div>
	);
}
