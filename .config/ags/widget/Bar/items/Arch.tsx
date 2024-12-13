import BarItem from "../BarItem";


const Text = "test"
const Logo = "/home/austin/.config/ags/arch.svg";

export default () => {
  return (
      <BarItem>
        <box>
          <label label={Text} />
		  {/* <img src={Logo} alt="Arch Logo" /> */}
        </box>
      </BarItem>
  );
};