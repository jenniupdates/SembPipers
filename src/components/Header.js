import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import MenuItem from "@mui/material/MenuItem";

import scLogo from "../assets/images/sembcorp_logo.png";

function Header(props) {
	let navigate = useNavigate();

	const logMeOut = () => {
		axios({
			method: "POST",
			url: "http://localhost:5001/logout",
		})
			.then(() => {
				props.token();
				navigate("/");
			})
			.catch((error) => {
				if (error.response) {

				}
			});
	};

	const [anchorEl, setAnchorEl] = useState(null);
	const open = Boolean(anchorEl);

	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	return (
		<AppBar position="static" sx={{ bgcolor: "white" }}>
			<Container maxWidth="xl">
				<Toolbar disableGutters>
					<img src={scLogo} alt="sembcorp-logo" width={100} />

					<Box sx={{ flexGrow: 1, display: "flex" }}>
						<IconButton size="large" color="inherit">
							<MenuIcon />
						</IconButton>
					</Box>

					{localStorage.getItem("token") === null ? null : (
						<Box sx={{ flexGrow: 0 }}>
							<IconButton onClick={handleClick} sx={{ p: 0 }}>
								<Avatar>
									{localStorage.getItem("userEmail").slice(0, 1).toUpperCase()}
								</Avatar>
							</IconButton>

							<Menu
								sx={{ mt: "45px" }}
								id="menu-appbar"
								anchorEl={anchorEl}
								open={open}
								onClose={handleClose}
								onClick={handleClose}
								anchorOrigin={{
									vertical: "top",
									horizontal: "right",
								}}
								keepMounted
								transformOrigin={{
									vertical: "top",
									horizontal: "right",
								}}
							>
								<MenuItem onClick={() => navigate("profile")}>
									<Typography textAlign="center">Profile</Typography>
								</MenuItem>
								<MenuItem onClick={logMeOut}>
									<Typography textAlign="center">Logout</Typography>
								</MenuItem>
							</Menu>
						</Box>
					)}
				</Toolbar>
			</Container>
		</AppBar>
	);
}

export default Header;
