import ProductForm from "./ProductForm";
import "./Admin.css";

export default function AddProduct() {
  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Add Product</h1>
          <p>Create a new product listing</p>
        </div>
      </div>
      <ProductForm mode="add" />
    </div>
  );
}
