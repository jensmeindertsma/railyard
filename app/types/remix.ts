import { ActionFunction, type LinksFunction } from "@remix-run/node";
import { type MetaFunction } from "@remix-run/react";

export type ActionArguments = Parameters<ActionFunction>[0];
export type LinksResult = ReturnType<LinksFunction>;
export type MetaArguments = Parameters<MetaFunction>[0];
export type MetaResult = ReturnType<MetaFunction>;
