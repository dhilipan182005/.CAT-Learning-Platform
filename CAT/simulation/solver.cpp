#include <iostream>
using namespace std;

int main(int argc, char* argv[])
{

double voltage = atof(argv[1]);
double resistance = atof(argv[2]);

double current = voltage / resistance;
double power = voltage * current;

cout << current << " " << power;

return 0;

}