import Events from "./Events";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import SeatPicker from "./SeatPicker";
import SeatEditor from "./SeatEditor";

const router = createBrowserRouter([
	{
		path: '/',
		element: <Events/>
	},
	{
		path: '/events/:eventId',
		element: <SeatPicker/>
	},
	{
		path: '/seatedit/:eventId',
		element: <SeatEditor/>
	}
])


export default function App() {

	return (
		<div className="container mx-auto "   >
			<RouterProvider router={router}/>
		</div>
	);

};

