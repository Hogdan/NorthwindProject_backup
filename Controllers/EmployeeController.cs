using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

public class EmployeeController(DataContext db) : Controller
{
  // this controller depends on the DataContext class
  private readonly DataContext _dataContext = db;

  [Authorize(Roles = "northwind-employee")]
  public IActionResult Inventory() => View(_dataContext.Categories.OrderBy(c => c.CategoryName).ToList());
}