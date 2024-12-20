#pragma once

#include <string>
#include <unordered_map>

namespace commands {

class ModelSourceDelCmd {
 public:
  bool Exec(const std::string& host, int port, const std::string& model_source);
};
}  // namespace commands
