function Section({ children, id }) {
  return (
    <div className="container2 fade-in" id={id}>
      {children}
    </div>
  );
}

export default Section;
