using System.Web;
using System.Web.Mvc;

namespace aspFullTest8d4f0416
{
   public class FilterConfig
   {
      public static void RegisterGlobalFilters(GlobalFilterCollection filters)
      {
         filters.Add(new HandleErrorAttribute());
      }
   }
}
