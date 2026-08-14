
interface Expenscardprops{
id:number;
title:string;
amount:number;
category:string;
date:string;
onDelete: (id:number) => void;
};
function ExpenseCard({ id, title, amount, category, date, onDelete }:Expenscardprops) {
  return (
    <div className="expense-card">
      <h3>{title}</h3>
      <p>Amount: ₹{amount}</p>
      <p>Category: {category}</p>
      <p>Date: {date}</p>

      <button className="delete-btn" onClick={() => onDelete(id)}>
        Delete
      </button> 
    </div>
  );
}

export default ExpenseCard;