import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";

const citiesContext = createContext();

const initialState = {
  cities: [],
  isLoading: false,
  currentCity: {},
  error: "",
};

const reducer = (state, action) => {
  switch (action.type) {
    // loading
    case "loaded":
      return {
        ...state,
        isLoading: true,
      };
    // cities/fetch
    case "cities/fetch":
      return {
        ...state,
        cities: action.payload,
        isLoading: false,
      };
    // city/getCurrent
    case "city/getCurrent":
      return {
        ...state,
        currentCity: action.payload,
        isLoading: false,
      };
    // city/create
    case "city/create":
      return {
        ...state,
        cities: [...state.cities, action.payload],
        currentCity: action.payload,
        isLoading: false,
      };
    // city/delete
    case "city/delete":
      return {
        ...state,
        isLoading: false,
        cities: state.cities.filter((city) => city.id !== action.payload),
      };
    // error
    case "error":
      return {
        ...state,
        error: action.payload,
      };

    default:
      return state;
  }
};

function CitiesProvider({ children }) {
  const [{ cities, isLoading, currentCity, error }, dispatch] = useReducer(
    reducer,
    initialState
  );
  // const [cities, setCities] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [currentCity, setCurrentCity] = useState({});

  useEffect(() => {
    const fetchCities = async () => {
      dispatch({ type: "loaded" });
      try {
        const res = await fetch("http://localhost:3000/cities");
        const data = await res.json();
        dispatch({ type: "cities/fetch", payload: data });
      } catch (err) {
        dispatch({ type: "error", payload: "error fetch cities" });
      }
    };

    fetchCities();
    // console.log(cities);
  }, []);

  const getCity = useCallback(
    async (id) => {
      if (Number(id) === currentCity.id) return;

      dispatch({ type: "loaded" });

      try {
        const res = await fetch(`http://localhost:3000/cities/${id}`);
        const data = await res.json();
        dispatch({ type: "city/getCurrent", payload: data });
      } catch (err) {
        dispatch({ type: "error", payload: "error get city" });
      }
    },
    [currentCity.id]
  );

  // CREATE CITY
  const createCity = async (newCity) => {
    dispatch({ type: "loaded" });

    try {
      const res = await fetch("http://localhost:3000/cities", {
        method: "POST",
        body: JSON.stringify(newCity),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      dispatch({ type: "city/create", payload: data });
    } catch (err) {
      dispatch({ type: "error", payload: "error create city" });
    }
  };

  // DELETE CITY
  const deleteCity = async (id) => {
    dispatch({ type: "loaded" });

    try {
      await fetch(`http://localhost:3000/cities/${id}`, {
        method: "DELETE",
      });
      dispatch({ type: "city/delete", payload: id });
    } catch (err) {
      dispatch({ type: "error", payload: "error delete city" });
    }
  };

  return (
    <citiesContext.Provider
      value={{
        cities,
        isLoading,
        error,
        getCity,
        currentCity,
        createCity,
        deleteCity,
      }}
    >
      {children}
    </citiesContext.Provider>
  );
}

const useCities = () => {
  const context = useContext(citiesContext);
  if (context === undefined) throw new Error("there is no context for cities");
  return context;
};

export { CitiesProvider, useCities };
