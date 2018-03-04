using System.Web;
using System.Web.Mvc;

namespace aspFullTestd309bc60
{
   public class FilterConfig
   {
      public static void RegisterGlobalFilters(GlobalFilterCollection filters)
      {
         filters.Add(new HandleErrorAttribute());
      }
   }
}
