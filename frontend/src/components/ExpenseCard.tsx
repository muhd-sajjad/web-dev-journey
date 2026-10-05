
interface Expenscardprops{
id:number;
title:string;
amount:number;
category:string;
date:string;
onDelete: (id: number) => void | Promise<void>;
onEdit: (id: number) => void | Promise<void>;
};
function ExpenseCard({ id, title, amount, category, date, onDelete ,onEdit}:Expenscardprops) {
  return (
    <div className="expense-card">
      <h3>{title}</h3>
      <p>Amount: ₹{amount}</p>
      <p>Category: {category}</p>
      <p>Date: {date}</p>

      <button className="delete-btn" onClick={() => onDelete(id)}>
        Delete
      </button>
      <button className="edit-btn" onClick={() => onEdit(id)}>
        Edit
      </button> 
    </div>
  );
}

export default ExpenseCard;