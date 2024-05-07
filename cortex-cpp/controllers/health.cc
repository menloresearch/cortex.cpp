#include "health.h"
#include "utils/cortex_utils.h"

void health::asyncHandleHttpRequest(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback) {
  auto resp = cortex_utils::nitroHttpResponse();
  resp->setStatusCode(k200OK);
  resp->setContentTypeCode(CT_TEXT_HTML);
  resp->setBody("cortex-cpp is alive!!!");
  callback(resp);
}
