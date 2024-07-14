import FileBrowser from "../_components/file-browser";

export default function Favorites() {
  return (
    <div>
      <FileBrowser title="Favorites" favoritesOnly />
    </div>
  );
}
