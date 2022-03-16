import axios from "axios";
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [rides, setRides] = useState();
  const [rides_sorted, setRides_sorted] = useState();
  const [upcoming_rides, setUpcoming_rides] = useState();
  const [past_rides, setPast_rides] = useState();
  const [rides_filtered, setRides_filtered] = useState();
  const [user, setUser] = useState();
  const [cities, setCities] = useState();
  const [states, setStates] = useState();
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedState, setSelectedState] = useState();
  const [mainOption, setMainOption] = useState("NearestRides");
  const [resultRides, setResultRides] = useState();
  const [toggleFilterBox, setToggleFilterBox] = useState(false);

  useEffect(() => {
    if (mainOption === "NearestRides") {
      setResultRides(rides_filtered);
    } else if (mainOption === "UpcomingRides") {
      setResultRides(upcoming_rides);
    } else if (mainOption === "PastRides") {
      setResultRides(past_rides);
    }
  }, [mainOption, past_rides, rides_filtered, upcoming_rides]);

  useEffect(() => {
    axios
      .get("https://assessment.api.vweb.app/rides")
      .then((res) => {
        setRides(res.data);

        const result = [];
        const map = new Map();
        for (const item of res.data) {
          if (!map.has(item.city)) {
            map.set(item.city, true);
            result.push(item.city);
          }
        }
        setCities(result);

        const r = [];
        const mapState = new Map();
        for (const item of res.data) {
          if (!mapState.has(item.state)) {
            mapState.set(item.state, true);
            r.push(item.state);
          }
        }
        setStates(r);
      })
      .catch((err) => {
        console.log(err);
      });

    // get user
    axios
      .get("https://assessment.api.vweb.app/user")
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  // console.log(states, cities);

  // ? nearest
  useEffect(() => {
    if (user && rides) {
      var _rides = rides;

      if (user.station_code) {
        _rides.forEach((ride, id) => {
          let closest = ride.station_path.reduce((a, b) => {
            return Math.abs(b - user.station_code) <
              Math.abs(a - user.station_code)
              ? b
              : a;
          });
          _rides[id].distance = Math.abs(user.station_code - closest);
        });
      }
      _rides.sort(function (a, b) {
        return a.distance > b.distance ? 1 : -1;
      });
      setRides_sorted(_rides);
    }
  }, [rides, user]);

  // ! state filtering
  useEffect(() => {
    if (rides_sorted) {
      var result = rides_sorted;
      if (selectedState && selectedCity) {
        result = result.filter((ride) => ride.state === selectedState);

        const filteredStateCity = result.filter(
          (ride) => ride.city === selectedCity
        );
        if (filteredStateCity.length > 0) {
          console.log("filteredStateCity", filteredStateCity);
          setRides_filtered(filteredStateCity);
        } else {
          setSelectedCity("");
          setRides_filtered(result);
          console.log("else", result);
        }
      } else if (selectedState) {
        result = result.filter((ride) => ride.state === selectedState);

        setSelectedCity("");
        setRides_filtered(result);
      } else if (selectedCity) {
        result = result.filter((ride) => ride.city === selectedCity);

        setRides_filtered(result);
      } else {
        setRides_filtered(rides_sorted);
      }
    }
  }, [selectedState, rides_sorted, selectedCity]);

  // console.log(user, rides);

  useEffect(() => {
    const r = [];
    if (selectedState && rides_sorted) {
      var result = rides_sorted;

      result = result.filter((ride) => ride.state === selectedState);

      const map = new Map();
      for (const item of result) {
        if (!map.has(item.city)) {
          map.set(item.city, true);
          r.push(item.city);
        }
      }
      setCities(r);
    } else if (rides_sorted) {
      const map = new Map();
      for (const item of rides_sorted) {
        if (!map.has(item.city)) {
          map.set(item.city, true);
          r.push(item.city);
        }
      }
      setCities(r);
    }
  }, [rides_sorted, selectedCity, selectedState]);

  // ! Past rides
  useEffect(() => {
    if (rides_filtered) {
    }
  }, [rides_filtered]);

  useEffect(() => {
    if (rides_filtered) {
      var upcoming = [],
        past = [];

      rides_filtered.forEach((ride) => {
        if (new Date(ride.date) > Date.now()) {
          upcoming.push(ride);
        } else {
          past.push(ride);
        }

        setUpcoming_rides(upcoming);
        setPast_rides(past);
      });
    }
  }, [rides_filtered]);

  return (
    <div className="App">
      <div className="nav">
        <div className="logo__name">Edvora</div>

        <div className="right__nav">
          <div className="user__name">{user ? user.name : "user name"}</div>
          <div className="user__img">
            <img src={user ? user.url : ""} alt="" />
          </div>
        </div>
      </div>
      <div className="filters">
        <div className="left__filters">
          <div
            className={`main__filters ${
              mainOption === "NearestRides" ? "main__filters__selected" : ""
            }`}
            onClick={() => setMainOption("NearestRides")}
          >
            Nearest rides
          </div>
          <div
            className={`main__filters ${
              mainOption === "UpcomingRides" ? "main__filters__selected" : ""
            }`}
            onClick={() => setMainOption("UpcomingRides")}
          >
            Upcoming rides ({upcoming_rides ? upcoming_rides.length : ""})
          </div>
          <div
            className={`main__filters ${
              mainOption === "PastRides" ? "main__filters__selected" : ""
            }`}
            onClick={() => setMainOption("PastRides")}
          >
            Past rides ({past_rides ? past_rides.length : ""})
          </div>
        </div>

        <div
          className="right__filters"
          onClick={() => setToggleFilterBox(!toggleFilterBox)}
        >
          <div className="right__filters__logo">
            <img src="/assets/hamburger.png" alt="" />
          </div>
          <div className="right__filter">Filters</div>
        </div>
      </div>
      {toggleFilterBox ? (
        <div className="filterBox">
          <div className="filterHead">Filters</div>
          {states ? (
            <select
              name=""
              id=""
              onChange={(e) => setSelectedState(e.target.value)}
            >
              <option value="">All States</option>

              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          ) : (
            ""
          )}
          {/* <br /> */}
          {cities ? (
            <select
              name=""
              id=""
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="">All Cities</option>

              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          ) : (
            ""
          )}
        </div>
      ) : (
        ""
      )}
      {resultRides
        ? resultRides.map((ride, id) => (
            <div className="card" key={id}>
              <div className="card__left">
                <div className="card__map">
                  <img src={ride.map_url} alt="" />
                </div>
                <div className="card__details">
                  <div className="card__entry">
                    <span className="subject">Ride Id : </span>
                    <span className="value">{ride.id}</span>
                  </div>
                  <div className="card__entry">
                    <span className="subject">Origin Station : </span>
                    <span className="value">{ride.origin_station_code}</span>
                  </div>
                  <div className="card__entry">
                    <span className="subject">station_path : [ </span>
                    <span className="value">
                      {ride.station_path
                        ? ride.station_path.map((path, id) =>
                            id === 0 ? (
                              <span>{path}</span>
                            ) : (
                              <span>, {path}</span>
                            )
                          )
                        : ""}{" "}
                      ]
                    </span>
                  </div>
                  <div className="card__entry">
                    <span className="subject">Date : </span>
                    <span className="value">{ride.date}</span>
                  </div>
                  <div className="card__entry">
                    <span className="subject">Distance : </span>
                    <span className="value">
                      {ride.distance ? ride.distance : "0"}
                    </span>
                  </div>
                  {/* <div className="card__entry">
                    <span className="subject">closest : </span>
                    <span className="value">
                      {ride.closest ? ride.closest : ""}
                    </span>
                  </div> */}
                </div>
              </div>

              <div className="card__right">
                <div className="card__names">{ride.city}</div>
                <div className="card__names">{ride.state}</div>
              </div>
            </div>
          ))
        : "..."}
    </div>
  );
}

export default App;
