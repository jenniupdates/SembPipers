import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Profile from "./components/Profile";
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import DataEntryPage from "./pages/Engineers/DataEntryPage";
import useToken from "./utils/useToken";
import AdminHomePage from "./pages/Admin/HomePage";
import AccountsMgmt from "./pages/Admin/AccountsMgmt";
import NoAccess from "./pages/NoAccess";
import Error from "./pages/Error";
import DataEntry from "./pages/Admin/DataEntryOptions";
import SchemaUpload from "./pages/Admin/SchemaUpload";
import DataValidation from "./pages/Admin/DataValidation";
import GenericFunctions from "./pages/Admin/GenericFunctions";
import DataManipulation from "./pages/Admin/DataManipulation";
import AnnotationPage from "./pages/Engineers/AnnotationPage";

import ConfigTablePage from "./pages/Engineers/ConfigTablePage";
import ImportDataPage from "./pages/Engineers/ImportDataPage";
import UpdatePassword from "./pages/UpdatePassword";

const App = () => {
	const { token, removeToken, setToken } = useToken();

	return (
		<BrowserRouter>
			<div sx={{ p: 10 }}>
				<Header token={removeToken} />
				{!token && token !== "" && token !== undefined ? (
					<Login setToken={setToken} />
				) : (
					<>
						<Navbar />
						<Routes>
							<Route
								exact
								path="/profile"
								element={<Profile token={token} setToken={setToken} />}
							/>


							<Route exact path="/updatePassword" element={<UpdatePassword />} />
							<Route exact path="/engineer/entry" element={<DataEntryPage />} />
							<Route exact path="/engineer/entry/import" element={<ImportDataPage />} />
							<Route
								exact
								path="/engineer/config"
								element={<ConfigTablePage />}
							/>
							<Route exact path="/engineer/annotation" element={<AnnotationPage />} />

							<Route exact path="/admin" element={<AdminHomePage />} />
							<Route exact path="/admin/dataEntryOptions" element={<DataEntry />} />
							<Route exact path="/admin/dataEntryOptions/entry" element={<DataEntryPage />} />
							<Route exact path="/admin/dataEntryOptions/entry/import" element={<ImportDataPage />} />
							<Route exact path="/admin/dataEntryOptions/schemaUpload" element={<SchemaUpload />} />
							<Route exact path="/admin/dataEntryOptions/rulesMgmt" element={<DataValidation />} />
							<Route exact path="/admin/dataManipulation" element={<DataManipulation />}/>
							<Route exact path="/admin/dataEntryOptions/configTable" element={<ConfigTablePage />} />
							<Route exact path="/admin/accounts" element={<AccountsMgmt />} />
							<Route exact path="/admin/dataEntryOptions/rulesMgmt/genericFunctions" element={<GenericFunctions />}  />
							<Route exact path="/admin/annotation" element={<AnnotationPage />} />
							
							<Route exact path="/noAccess" element={<NoAccess />} />
							<Route path="/404" element={<Error />} />
							<Route path="*" element={<Navigate replace to="/404" />} />
						</Routes>
					</>
				)}
			</div>
		</BrowserRouter>
	);
};

export default App;
