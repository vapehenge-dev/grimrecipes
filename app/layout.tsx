import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={title:"GrimRecipes — Real Food. Bad Attitude.",description:"Proper recipes for real life. Search by ingredient, plan the week and build your shopping list.",icons:{icon:"/favicon.svg",shortcut:"/favicon.svg"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en-GB"><body>{children}</body></html>}
