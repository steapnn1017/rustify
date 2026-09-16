import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="container prose">
        <p className="kicker">404</p>
        <h1>No such node</h1>
        <p>That route is not on this cluster.</p>
        <Link className="btn btn-primary" href="/">
          Back to cluster
        </Link>
      </div>
    </section>
  );
}
