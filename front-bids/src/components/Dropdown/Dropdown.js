function Dropdown({ onChange, values }) {
  return (
    <div className="dropdown-wrapper">
      <select onChange={onChange}>
        <option value=""></option>
        {values.map((value) => {
          return (
            <option value={value} key={value}>
              {value}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export default Dropdown;
