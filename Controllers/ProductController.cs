using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Rendering;

public class ProductController : Controller
{
  // this controller depends on the NorthwindRepository
  private DataContext _dataContext;
  public ProductController(DataContext db) => _dataContext = db;
  public IActionResult Category() => View(_dataContext.Categories.OrderBy(c => c.CategoryName));
  public IActionResult Index(int id){
    ViewBag.id = id;
    return View(_dataContext.Categories.OrderBy(c => c.CategoryName));
  }
  public IActionResult Edit(int id)
  {
    var product = _dataContext.Products.Find(id);
    if (product == null)
    {
      return NotFound();
    }
    ViewBag.Categories = _dataContext.Categories
      .OrderBy(c => c.CategoryName)
      .Select(c => new SelectListItem 
      { 
        Value = c.CategoryId.ToString(), 
        Text = c.CategoryName 
      });
    return View(product);
  }
  [Authorize(Roles = "northwind-employee"), HttpPost, ValidateAntiForgeryToken]
  public IActionResult Edit(Product product)
  {
    _dataContext.EditProduct(product);
    return RedirectToAction("Inventory", "Employee");
  }
}
