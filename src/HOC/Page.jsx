import React, { useEffect } from "react";
import Container from "../HOC/Container";
const Page = (props) => {
	useEffect(() => {
		document.title = `${props.title} | Amaben App`;
		window.scroll(0, 0);
	}, [props.title]); //this would always make i update since title is dynamic
	return <Container wide={props.wide}>{props.children}</Container>;
};

export default Page;
