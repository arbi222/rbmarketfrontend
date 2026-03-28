import "./statCard.css";
import CountUp from "react-countup";

const StatCard = ({title, value}) => (
  <div className="stat-card">
    <h3>{title}</h3>
    {title === "RB Market Revenue" ?
      <p>
        <CountUp start={0} end={value} duration={2} separator="," prefix="$" decimals={2} />
      </p>
    :
      <p>
        <CountUp start={0} end={value} duration={2} separator=","/>
      </p>
    }
  </div>
);

export default StatCard