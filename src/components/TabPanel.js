import { Box } from "@mui/system";

const TabPanel = ({ value, index, children, ...other }) => {
	return (
		<Box role="tabpanel" hidden={value !== index} {...other}>
			{value === index && <h1>{children}</h1>}
		</Box>
	);
};

export default TabPanel